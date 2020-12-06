const puppeteer = require("puppeteer");
const parser = require("node-html-parser");

class PhoneParser {
  constructor() {
    this.browser = null;
    this.initedBrowser = null;
  }

  // Запускаем фоновый браузер
  async init() {
    this.initedBrowser = await new Promise(async (resolve, reject) => {
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

  async getPhoneAndName(url) {
    // Создаем условную вкладку
    const page = await this.browser.newPage();

    try {
      await page.goto(url, { timeout: 0 });

      // Ждем когда появится кнопка дял показа телеофна
      await page.waitForSelector("div.card__contact", {
        timeout: 1000,
      });
      // Кликаем по кнопке Показать телефон
      await page.click("div.card__contact button.button--secondary");
      // Ждем когда появится блок справа, где прописан телефон и имя автора объявления
      await page.waitForSelector("div.phones__card");

      // Парсим содержимое кликнутой страницы
      const root = parser.parse(await page.content());
      page.close();

      // Парсим телефон и имя
      let phones = root.querySelectorAll("ul.phones__list li");

      phones = phones
        ? phones.map((phone) => phone.innerText.replace(/[^\d]/g, "")).join("|")
        : "";

      const author = root.querySelector("p.phones__owner").innerText;

      return { phone: phones, author, url: new URL(url).pathname };
    } catch (e) {
      page.close();

      return null;
    }
  }

  // Закрываем браузер
  close() {
    console.log("Browser closing...");
    this.browser.close();
  }
}

module.exports = PhoneParser;
