const axios = require("axios");
const parser = require("node-html-parser");
const Helper = require("./helper");

class SiteParser {
  static parseAdvt(url) {
    return axios
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
        const price_usd = temp ? Helper.getPriceUsd(temp.innerText) : -1;

        // Полная ссылка
        const full_url = new URL(response.config.url);

        // Сайт
        const site = full_url.host;

        // Ссылка
        const url = full_url.pathname;

        // Коробка передач
        temp = root.querySelector(".card__params");
        const transmission = temp ? Helper.getTransmission(temp.innerText) : "";

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
        const description = temp ? Helper.getDescription(temp.innerText) : "";

        // Возможен ли обмен
        temp = root.querySelector(".card__exchange-title");
        const exchange = temp ? Helper.getPossOfExchange(temp.innerText) : "";

        // Дополнительные опции
        temp = root.querySelectorAll(
          ".card__options-wrap .card__options-section"
        );

        const security_systems = temp ? Helper.getSecuritySystems(temp) : "";
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
      .catch((error) => {
        console.log(error);
      });
  }

  // Находим ссылки на новые объявления
  static parseUrlsOfAdvts(host, url) {
    return axios
      .get(host + url)
      .then((response) => {
        const root = parser.parse(response.data);

        const listUrls = root
          .querySelectorAll(".listing__items .listing-item .listing-item__link")
          .map((link) => link.rawAttrs.match(/href="(.*?)"/)[1]);

        return listUrls;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // Отправляем найденные ссылки на странице на сервер, и там оперделяем уникальные, которых нету в БД
  static getUniqueLinks(site, server, listLinks) {
    return axios
      .post(server, { site, listLinks })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
  }
}

module.exports = SiteParser;
