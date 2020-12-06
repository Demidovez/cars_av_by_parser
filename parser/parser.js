const axios = require("axios");
const parser = require("node-html-parser");
const PhoneParser = require("../phone-parser/phone-parser");
const Helper = require("./helper");
const CONFIG = require("../config/config");
const parseOneAdvt = require("./parse-one-advt");

class Parser {
  // Определяем дефолтные значения
  constructor() {
    this.isStart = false;
    this.isWorking = true;
    this.period = CONFIG.PERIOD_WORK;
    this.site = CONFIG.HOST_DONOR;
    this.pageStart = CONFIG.PAGE_START;
    this.phoneParser = new PhoneParser();
  }

  async init() {
    // Инициализируем отдельный парсер телефонов
    await this.phoneParser.init();

    // Достаем текущие опции парсера с сервера, и пытаемся запустить парсинг объявления
    axios
      .post(CONFIG.SERVER_GET_OPTIONS, { site: this.site })
      .then((options) => this.setOptions(options))
      .then(() => {
        this.runParseAdvt();
        this.runParsePhone();
      })
      .catch((error) => {
        this.isWorking == false;
        console.log(error);
      });
  }

  // Установка новых опций парсера
  setOptions(options) {
    const { start, period, page_start } = options.data;

    this.isStart = start;
    this.period = period;
    this.pageStart = page_start;

    // Если парсер был остановлен и пришла команда на запуск то запускаем парсера
    if (this.isWorking == false && this.isStart) {
      this.runParseAdvt();
      this.runParsePhone();
    }
  }

  // Запуск парсинга
  runParseAdvt() {
    if (this.isStart) {
      this.isWorking == true;

      this.startParsingAdvts()
        .then(() => this.runParseAdvt())
        .catch(() => {
          this.isStart = false;
        });
    }
  }

  // Запуск парсинга телефонов и авторов
  // TODO: Один раз отвалился, хз почему, нужно перепроверить
  runParsePhone() {
    if (this.isStart) {
      axios
        .post(CONFIG.SERVER_GET_URLS_PHONE, { site: this.site })
        .then(async (listUrl) => {
          if (listUrl.data.length == 0) {
            await Helper.setTimeout(this.period * 3);
          } else {
            for (const url of listUrl.data) {
              await this.phoneParser
                .getPhoneAndName(url)
                .then(async (phoneData) =>
                  phoneData
                    ? axios
                        .post(CONFIG.SERVER_SEND_PHONE, phoneData)
                        .then(() =>
                          console.log("Отправка на сервер " + phoneData.phone)
                        )
                        .catch((error) => console.log(error))
                    : null
                )
                .catch((error) => console.log(error));
            }
          }
        })
        .then(() => this.runParsePhone())
        .catch((error) => console.log(error));
    }
  }

  // Останов парсинга
  stop() {
    this.isStart = false;
    this.isWorking == false;

    // Уведомляем сервер о текущем состоянии
    axios
      .post(CONFIG.SERVER_SEND_MESSAGE, {
        options: { isStart: this.isStart, site: this.site },
      })
      .catch((error) => console.log(error));
  }

  // Сам парсинг по тегам и html-элементам
  startParsingAdvts() {
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

      // Начинаем парсить каждое объявление
      if (listUniqueLinks && listUniqueLinks.length) {
        await Promise.all(
          listUniqueLinks.map((url) =>
            axios
              .get(url)
              .then((response) =>
                parseOneAdvt(response.data, response.config.url)
              )
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
        await Helper.setTimeout(this.period);

        resolve();
      }
    });
  }
}

module.exports = Parser;
