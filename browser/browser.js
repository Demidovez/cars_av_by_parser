const puppeteer = require("puppeteer");
const parser = require("node-html-parser");

class Browser {
  constructor() {
    // Создаем поля класса
    this.browser = null;
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

        return resolve(browser);
      } catch (e) {
        return reject(e);
      }
    }).then(
      (browser) => {
        this.browser = browser;
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
      // Создаем условную вкладку
      const page = await this.browser.newPage();

      try {
        await page.goto(url, { timeout: 0 });
        // Кликаем по кнопке Показать телефон
        await page.click("div.card__contact button.button--secondary");
        // Ждем когда появится блок справа, где прописан телефон и имя автора объявления
        await page.waitForSelector("div.phones__card");

        // Парсим содержимое кликнутой страницы
        const root = parser.parse(await page.content());

        // Парсим телефон и имя
        const phone = root
          .querySelector("ul.phones__list li")
          .innerText.replace(/[^\d]/g, "");

        const author = root.querySelector("p.phones__owner").innerText;

        return resolve({ phone, author, url });
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
