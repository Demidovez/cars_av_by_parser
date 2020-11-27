const puppeteer = require("puppeteer");

class Browser {
  constructor() {
    this.browser = null;
    this.page = null;
    this.initedBrowser = null;
  }

  init() {
    this.initedBrowser = new Promise(async (resolve, reject) => {
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
    // console.log(this.page);
    return new Promise(async (resolve, reject) => {
      try {
        await this.page.goto(url);
        await this.page.click("div.card__contact button.button--secondary");
        await this.page.waitForSelector("div.phones__card");

        let phone_author = await this.page.evaluate(() => {
          let results = [];

          results.push({
            phone: document
              .querySelector("ul.phones__list li")
              .innerText.replace(/[^\d]/g, ""),
            author: document.querySelector("p.phones__owner").innerText,
          });

          return results;
        });
        return resolve(phone_author);
      } catch (e) {
        return reject(e);
      }
    });
  }

  close() {
    // this.initedBrowser.then(() => {
    //   this.browser.close();
    //   console.log("Browser closing...");
    // });

    //this.browser.close();
    console.log("Browser closing...");
  }
}

module.exports = Browser;
