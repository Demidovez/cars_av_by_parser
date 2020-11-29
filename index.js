const Browser = require("./browser/browser");
const SiteParser = require("./siteparser/siteparser");
const Helper = require("./siteparser/helper");
const CONFIG = require("./config/config");
const axios = require("axios");

/*
 *
 * Создаем и запускаем браузер,
 * для отдельного поиск номером телефонов и имен
 *
 */
const startParsingPhoneAndAuthor = () => {
  // const browser = new Browser();
  // browser
  //   .init()
  //   .then(() =>
  //     browser
  //       .getPhoneAndName("https://cars.av.by/uaz/hunter/100106062")
  //       .then((result) => {
  //         console.log(result);
  //         return result;
  //       })
  //       .catch(console.error)
  //   )
  //   .then(() => browser.close());
};

/*
 *
 * Находим ссылки на новые объвления
 * и начинаем парсить по ним
 *
 */

const startParsingAdvts = async () => {
  // Парсим 10 новых страниц (нужно доработать)
  for (let numPage = 1; numPage <= 10; numPage++) {
    console.log("================= Страница " + numPage);

    await SiteParser.parseUrlsOfAdvts(
      CONFIG.SITE_DONOR,
      "/filter?page=" + numPage + "&sort=4"
    )
      // Находим уникальные ссылки, которых нету в БД
      .then((listNewLinks) =>
        SiteParser.getUniqueLinks(
          CONFIG.HOST_DONOR,
          CONFIG.SERVER_UNIQ_LINKS,
          listNewLinks
        )
      )
      .then((listUniqueLinks) => {
        console.log("Новых ссылок " + listUniqueLinks.length);
        console.log(listUniqueLinks);

        return listUniqueLinks;
      })
      // Начинаем парсить каждое обявление
      .then(
        async (listUniqueLinks) =>
          await Promise.all(
            listUniqueLinks.map((url) =>
              SiteParser.parseAdvt(CONFIG.SITE_DONOR + url).then((advt) => {
                // Отправка на сервер
                axios
                  .post(CONFIG.SERVER_SAVE_ADVT, advt)
                  .then(() => {
                    console.log(
                      "Отправка на сервер " +
                        advt.model +
                        " " +
                        advt.series +
                        " " +
                        advt.generation +
                        ": " +
                        advt.url
                    );
                  })
                  .catch(function (error) {
                    console.log(error);
                  });
              })
            )
          )
      );
  }
};

const main = () => {
  startParsingPhoneAndAuthor();
  startParsingAdvts();
};

main();
