const puppeteer = require("puppeteer");

class Browser {
  constructor() {
    // Создаем поля класса
    this.browser = null;
    this.page = null;
    this.initedBrowser = null;
  }

  // Запускаем фоновый браузер
  init() {
    this.initedBrowser = new Promise(async (resolve, reject) => {
      try {
        // Создаем условный браузер
        const browser = await puppeteer.launch({
          headless: true,
          args: ["--no-sandbox"],
        });
        // Создаем условную вкладку
        const page = await browser.newPage();

        return resolve({ browser, page });
      } catch (e) {
        return reject(e);
      }
    }).then(
      ({ browser, page }) => {
        this.browser = browser;
        this.page = page;
      },
      (error) => {
        console.log(error);
      }
    );

    return this.initedBrowser;
  }

  getPhoneAndName(url) {
    // Открываем страницу объявлени
    return new Promise(async (resolve, reject) => {
      const page = await this.browser.newPage();
      try {
        await page.goto(url, { timeout: 0 });
        // Кликаем по кнопке Показать телефон
        await page.click("div.card__contact button.button--secondary");
        // Ждем когда появится блок справа, где прописан телефон и имя автора объявления
        await page.waitForSelector("div.phones__card");

        console.log("________ " + url);
        console.log(page._target._targetInfo.url);

        // Парсим телефон и имя
        let phone_author = await page.evaluate(() => {
          const results = {
            phone: document
              .querySelector("ul.phones__list li")
              .innerText.replace(/[^\d]/g, ""),
            author: document.querySelector("p.phones__owner").innerText,
          };

          return results;
        });
        return resolve({ ...phone_author, url });
      } catch (e) {
        return reject(e);
      } finally {
        await page.close();
      }
    });
  }

  // Закрываем браузер
  close() {
    console.log("Browser closing...");
    this.browser.close();
  }
}

module.exports = Browser;
