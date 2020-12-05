const Browser = require("../browser/browser");
const parser = require("node-html-parser");
const Helper = require("./helper");
const CONFIG = require("../config/config");
const axios = require("axios");

class Parser {
  constructor() {
    this.isStart = false;
    this.isWorking = true;
    this.mode = "Hard";
    this.period = 5000;
    this.site = "cars.av.by";
    this.pageStart = "https://cars.av.by/filter?sort=4";

    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.log("Инициализируем сервер");
  }

  // Редактирование настроек
  setOptions(options) {
    const { start, mode, period, page_start } = options.data;

    this.isStart = start;
    this.mode = mode;
    this.period = period;
    this.pageStart = page_start;

    if (this.isWorking == false && this.isStart) {
      this.run();
    }
  }

  tryStart() {
    axios
      .post(CONFIG.SERVER_GET_OPTIONS, { site: this.site })
      .then((options) => this.setOptions(options))
      .then(() => {
        console.log("Пытаемся запуститься");

        this.run();
      })
      .catch((error) => {
        this.isWorking == false;
        console.log(error);
      });
  }

  // Запуск парсинга
  run() {
    if (this.isStart && this.mode == "Hard") {
      this.isWorking == true;

      console.log("Запускаем тяжелый парсинг");

      this._startHardParsingAdvts()
        .then(() => this.run())
        .catch(() => {
          this.isStart = false;
        });
    } else if (this.isStart && this.mode == "Light") {
      this.isWorking == true;

      console.log("Запускаем легкий парсинг");

      this._startLightParsingAdvts()
        .then(() => this.run())
        .catch(() => this.stop());
    }
  }

  // Останов парсинга
  stop() {
    this.isStart = false;
    this.isWorking == false;

    console.log("Останавливаем парсинг");

    // Уведомляем сервер о текущем состоянии
    axios
      .post(CONFIG.SERVER_SEND_MESSAGE, {
        options: { isStart: this.isStart, site: this.site },
      })
      .then(() => console.log("Отравили на сервер состояние парсинга"))
      .catch((error) => console.log(error));
  }

  // Тяжелый парсинг по тегам и html-элементам
  _startHardParsingAdvts() {
    return new Promise(async (resolve, reject) => {
      // Получаем ссылки на уникальные объявления
      const listUniqueLinks = await axios
        .get(this.pageStart)
        .then((response) => {
          const root = parser.parse(response.data);

          const listNewLinks = root
            .querySelectorAll(
              ".listing__items .listing-item .listing-item__link"
            )
            .map((link) => link.rawAttrs.match(/href="(.*?)"/)[1]);

          return listNewLinks;
        })
        // Находим уникальные ссылки, которых нету в БД
        .then((listNewLinks) =>
          axios
            .post(CONFIG.SERVER_UNIQ_LINKS, {
              site: CONFIG.HOST_DONOR,
              listLinks: listNewLinks,
            })
            .then((response) => response.data)
            .catch((error) => {
              console.log(error);
            })
        );

      console.log("Найдено уникальных ссылок: ", listUniqueLinks.length);
      console.log("Например первая ссылка: ", listUniqueLinks[0]);

      // Начинаем парсить каждое объявление
      if (listUniqueLinks.length) {
        await Promise.all(
          listUniqueLinks.map((url) =>
            axios
              .get(url)
              .then((response) => {
                const root = parser.parse(response.data);
                // В переменную temp будем сохранять промежеточные данные
                let temp = null;

                // Модель
                temp = root.querySelectorAll(".breadcrumb-item span");
                const model = temp ? Helper.getModel(temp) : "";

                // Серия
                const series = temp ? Helper.getSeries(temp) : "";

                // Заголовок (нужен для последующей обработки)
                temp = root.querySelector(".card__title");

                // Поколение
                const generation = temp
                  ? Helper.getGeneration(temp.innerText, series)
                  : "";

                // Год
                const year = temp ? Helper.getYear(temp.innerText) : -1;

                // Дата размещения
                temp = root.querySelectorAll(".card__stat .card__stat-item");
                const date_release = temp ? Helper.getDateRelease(temp) : "";

                // Внутренний ID (артикул) объявления на сайте
                const id_inner = temp ? Helper.getIdInner(temp) : -1;

                // Цена
                temp = root.querySelector(".card__price-primary");
                const price = temp ? Helper.getPrice(temp.innerText) : -1;

                // Цена в долларах
                temp = root.querySelector(".card__price-secondary");
                const price_usd = temp
                  ? Helper.getPriceUsd(temp.innerText)
                  : -1;

                // Полная ссылка
                const full_url = new URL(response.config.url);

                // Сайт
                const site = full_url.host;

                // Ссылка
                const url = full_url.pathname;

                // Коробка передач
                temp = root.querySelector(".card__params");
                const transmission = temp
                  ? Helper.getTransmission(temp.innerText)
                  : "";

                // Объем двигателя
                const volume_engine = temp
                  ? Helper.getVolumeEngine(temp.innerText)
                  : -1;

                // Вид топлива
                const fuel = temp ? Helper.getFuel(temp.innerText) : "";

                // Пробег
                temp = root.querySelector(".card__params span");
                const mileage = temp ? Helper.getMileage(temp.innerText) : -1;

                // Определяем Кузов, Привод и Цвет
                temp = root.querySelector(".card__description");

                // Кузов
                const carcase = temp ? Helper.getCarcase(temp.innerText) : "";

                // Привод
                const gearing = temp ? Helper.getGearing(temp.innerText) : "";

                // Цвет
                const color = temp ? Helper.getColor(temp.innerText) : "";

                // Город
                temp = root.querySelector(".card__location");
                const city = temp ? Helper.getCity(temp.innerText) : "";

                // Фото
                temp = root.querySelectorAll(
                  ".gallery__stage-shaft .gallery__frame img"
                );

                const image = temp ? Helper.getImage(temp) : "";

                // Описание от автора
                temp = root.querySelector(".card__comment-text p");
                const description = temp
                  ? Helper.getDescription(temp.innerText)
                  : "";

                // Возможен ли обмен
                temp = root.querySelector(".card__exchange-title");
                const exchange = temp
                  ? Helper.getPossOfExchange(temp.innerText)
                  : "";

                // Дополнительные опции
                temp = root.querySelectorAll(
                  ".card__options-wrap .card__options-section"
                );

                const security_systems = temp
                  ? Helper.getSecuritySystems(temp)
                  : "";
                const cushions = temp ? Helper.getCushions(temp) : "";
                const help_systems = temp ? Helper.getHelpSystems(temp) : "";
                const exterior = temp ? Helper.getExterior(temp) : "";
                const interior = temp ? Helper.getInterior(temp) : "";
                const headlights = temp ? Helper.getHeadlights(temp) : "";
                const climate = temp ? Helper.getClimate(temp) : "";
                const heating = temp ? Helper.getHeating(temp) : "";
                const multimedia = temp ? Helper.getMultimedia(temp) : "";
                const comfort = temp ? Helper.getComfort(temp) : "";

                // Дата парсинга
                const date_parsing = new Date();

                // Телефон автора объвления, пока пустое, парсинг номеров и имени просиходит отдельным потоком
                const phone = "";

                // Имя автора объвления, пока пустое, парсинг номеров и имени просиходит отдельным потоком
                const author = "";

                const advt = {
                  model,
                  series,
                  generation,
                  year,
                  date_release,
                  id_inner,
                  price,
                  price_usd,
                  site,
                  url,
                  transmission,
                  volume_engine,
                  fuel,
                  mileage,
                  carcase,
                  gearing,
                  color,
                  city,
                  image,
                  description,
                  exchange,
                  security_systems,
                  cushions,
                  help_systems,
                  exterior,
                  interior,
                  headlights,
                  climate,
                  heating,
                  multimedia,
                  comfort,
                  date_parsing,
                  phone,
                  author,
                };

                // Возвращаем добытые данные
                return advt;
              })
              .then((advt) => {
                // Отправка на сервер
                axios
                  .post(CONFIG.SERVER_SAVE_ADVT, advt)
                  .then(() => console.log("Отправка на сервер " + advt.url))
                  .catch((error) => console.log(error));
              })
              .catch((error) => console.log(error))
          )
        )
          .then(() => resolve())
          .catch((error) => reject(error));
      } else {
        // Иначе ждем согласно period
        console.log("Ждем ", this.period);
        await setTimeout[Object.getOwnPropertySymbols(setTimeout)[0]](
          this.period
        );

        resolve();
      }
    });
  }

  async _startLightParsingAdvts() {
    return new Promise(async (resolve, reject) => {
      await setTimeout[Object.getOwnPropertySymbols(setTimeout)[0]](
        this.period
      );
      console.log("startLightParsingAdvts");
      resolve();
    });
  }
}

module.exports = Parser;
