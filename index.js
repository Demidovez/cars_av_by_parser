const Browser = require("./browser/browser");
const SiteParser = require("./siteparser/siteparser");

// Создаем и запускаем браузер
const browser = new Browser();
const runBrowser = browser.init();

// const parserData = SiteParser.parseAdvt(
//   "https://cars.av.by/ford/fusion/16737228"
// );

const listUrl = SiteParser.parseUrlsOfAdvts(
  "https://cars.av.by",
  "/filter?sort=4"
);

Promise.all([runBrowser, listUrl]).then(([, listUrl]) => {
  listUrl.map((url) => {
    const parserData = SiteParser.parseAdvt(url);

    const parserPhoneAndAuthor = browser
      .getPhoneAndName(url)
      .then((result) => {
        console.log(result);

        return result;
      })
      .catch(console.error);
  });
});

// SiteParser.parseUrlsOfAdvts("https://cars.av.by", "/filter?sort=4").then(
//   (listUrl) => {
//     const listAdvts = listUrl.map((url) => {
//       const parserData = SiteParser.parseAdvt(url);

//       const parserPhoneAndAuthor = browser
//         .getPhoneAndName(url)
//         .then((result) => {
//           // console.log(result);

//           return result;
//         })
//         .catch(console.error);

//       return Promise.all([parserData, parserPhoneAndAuthor]).then((result) => {
//         const [advt, phoneAndAuthor] = result;
//         const fullAdvt = { ...advt, ...phoneAndAuthor };

//         console.log(phoneAndAuthor);
//         console.log(fullAdvt.model);

//         // Отправка на сервер
//         console.log("Отправка на сервер...");

//         return fullAdvt;
//       });
//     });

//     Promise.all(listAdvts).then(() => browser.close());
//   }
// );
