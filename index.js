const puppeteer = require("puppeteer");
const axios = require("axios");
const parser = require("node-html-parser");

function getPhoneAndName(url) {
  return new Promise(async (resolve, reject) => {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-features=WebRtcHideLocalIpsWithMdns",
          "--disable-setuid-sandbox",
        ],
      });
      const page = await browser.newPage();
      await page.goto(url);
      await page.click("div.card__contact button.button--secondary"),
        await page.waitForSelector("div.phones__card");

      let urls = await page.evaluate(() => {
        let results = [];

        results.push({
          phone: document.querySelector("ul.phones__list li").innerText,
          name: document.querySelector("p.phones__owner").innerText,
        });

        return results;
      });
      browser.close();
      return resolve(urls);
    } catch (e) {
      return reject(e);
    }
  });
}

axios
  .get("https://cars.av.by/honda/cr-v/100102626")
  .then((response) => {
    // console.log(response.data);
    const root = parser.parse(response.data);

    const model = root.querySelectorAll(".breadcrumb-item a span")[1].rawText;
    const series = root.querySelectorAll(".breadcrumb-item a span")[2].rawText;
    const title = root.querySelector(".card__title").rawText;
    const generation = title.substring(
      title.indexOf(series) + series.length + 1,
      title.indexOf(",")
    );
    const year = parseInt(
      title.substring(title.indexOf(",") + 2, title.indexOf(",") + 6)
    );
    const dateRelease = root.querySelectorAll(".card__stat .card__stat-item")[1]
      .rawText;
    const idInner = parseInt(
      root
        .querySelectorAll(".card__stat .card__stat-item")[2]
        .rawText.split(" ")[1]
    );

    const advt = {
      model: model,
      series: series,
      generation: generation,
      year: year,
      dateRelease: dateRelease,
      idInner: idInner,
    };

    console.log(advt);
  })
  .catch((error) => {
    console.log(error);
  });

//getPhoneAndName().then(console.log).catch(console.error);
