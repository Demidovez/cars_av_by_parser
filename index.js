const axios = require("axios");
const parser = require("node-html-parser");
const Browser = require("./browser/browser");

const browser = new Browser();
const runBrowser = browser.init();

const listURLs = [
  "https://cars.av.by/nissan/qashqai/100071983",
  "https://cars.av.by/nissan/qashqai/100063295",
  "https://cars.av.by/nissan/qashqai/19765368",
  "https://cars.av.by/nissan/qashqai/19879125",
  "https://cars.av.by/nissan/qashqai/100102959",
  "https://cars.av.by/nissan/qashqai/19765368",
  "https://cars.av.by/nissan/qashqai/18718431",
  "https://cars.av.by/skoda/yeti/100079050",
  "https://cars.av.by/mazda/cx-5/100007850",
  "https://cars.av.by/kia/sorento/17920319",
  "https://cars.av.by/porsche/cayenne/16292696",
  "https://cars.av.by/honda/cr-v/100103406",
];

listURLs.forEach((url) =>
  axios
    .get(url)
    .then((response) => {
      const root = parser.parse(response.data);

      // Модель
      const model = root.querySelectorAll(".breadcrumb-item a span")[1].rawText;
      // Серия
      const series = root.querySelectorAll(".breadcrumb-item a span")[2]
        .rawText;

      // Заголовок (нужен для последующей обработки)
      const title = root.querySelector(".card__title").rawText;

      // Поколение
      const generation = title.substring(
        title.indexOf(series) + series.length + 1,
        title.indexOf(",")
      );

      // Год
      const year = parseInt(
        title.substring(title.indexOf(",") + 2, title.indexOf(",") + 6)
      );

      // Год производства
      const date_release = root.querySelectorAll(
        ".card__stat .card__stat-item"
      )[1].rawText;

      // Внутренний ID (артикул) объявления на сайте
      const id_inner = parseInt(
        root
          .querySelectorAll(".card__stat .card__stat-item")[2]
          .rawText.split(" ")[1]
      );

      // Цена
      const price = parseFloat(
        root
          .querySelector(".card__price-primary")
          .rawText.replace("р.", "")
          .replace(/[^.,\d]/g, "")
      );

      // Цена в долларах
      const price_usd = parseFloat(
        root
          .querySelector(".card__price-secondary")
          .rawText.replace(/[^.,\d]/g, "")
      );

      // Полная ссылка
      const full_url = new URL(response.config.url);

      // Сайт
      const site = full_url.host;

      // Ссылка
      const url = full_url.pathname;

      // Коробка передач
      const transmission = root
        .querySelector(".card__params")
        .innerText.split(", ")[1];

      // Объем двигателя
      const volume_engine = parseFloat(
        root
          .querySelector(".card__params")
          .innerText.split(", ")[2]
          .replace(/[^.,\d]/g, "")
      );

      // Вид топлива
      const fuel = root.querySelector(".card__params").innerText.split(", ")[3];

      // Пробег
      const mileage = parseFloat(
        root
          .querySelector(".card__params span")
          .innerText.replace(/[^.,\d]/g, "")
      );

      // Кузов
      const carcase = root
        .querySelector(".card__description")
        .innerText.split(", ")[0];

      // Привод
      const gearing = root
        .querySelector(".card__description")
        .innerText.split(", ")[1];

      // Цвет
      const color = root
        .querySelector(".card__description")
        .innerText.split(", ")[2];

      // Город
      const city = root.querySelector(".card__location").innerText;

      // Фото
      const image = root
        .querySelectorAll(".gallery__stage-shaft .gallery__frame img")[0]
        .rawAttrs.match(/data-src="(.*?)"/)[1];

      // Описание от автора
      const description = root.querySelector(".card__comment-text p").innerText;

      // Возможен ли обмен
      const is_exchange =
        root.querySelector(".card__exchange-title").innerText !=
        "Обмен не интересует";

      // Дополнительные опции
      const options = root
        .querySelectorAll(".card__options-wrap .card__options-section")
        .map(
          (option) =>
            option.childNodes[0].innerText +
            ":" +
            option.childNodes[1].childNodes
              .map((item_option) => item_option.innerText)
              .join("|")
        )
        .join("/");

      // Дата парисинга
      const date_parsing = new Date();

      // Формируем готовое объявление для отправки на сервер
      runBrowser.then(() =>
        browser
          .getPhoneAndName(full_url.href)
          .then((finalResult) => {
            // Телефон и имя
            const { phone, author } = finalResult[0];

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
              phone,
              author,
              description,
              is_exchange,
              options,
              date_parsing,
            };

            console.log(advt);
          })
          .catch(console.error)
      );
    })
    .catch((error) => {
      console.log(error);
    })
);

console.log("before close");
browser.close();
