const Browser = require("./browser/browser");
const SiteParser = require("./siteparser/siteparser");

/*
 *
 * Создаем и запускаем браузер,
 * для отдельного поиск номером телефонов и имен
 *
 */

const browser = new Browser();
browser
  .init()
  .then(() =>
    browser
      .getPhoneAndName("https://cars.av.by/uaz/hunter/100106062")
      .then((result) => {
        console.log(result);

        return result;
      })
      .catch(console.error)
  )
  .then(() => browser.close());

/*
 *
 * Находим ссылки на новые объвления
 * и начинаем парсить по ним
 *
 */

SiteParser.parseUrlsOfAdvts("https://cars.av.by", "/filter?sort=4").then(
  (listUrl) =>
    listUrl.map((url) =>
      SiteParser.parseAdvt(url).then((advt) => {
        console.log(advt);

        // Отправка на сервер
        console.log("Отправка на сервер...");
      })
    )
);
