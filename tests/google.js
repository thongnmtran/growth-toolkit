import { Builder, Browser, By } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { delay } from '../utils';
import { mkdir, writeFile } from 'fs/promises';
import { Data, Selectors } from './data';
import puppeteer from 'puppeteer';

async function click(driver, selector) {
  await driver.findElement(By.css(selector)).click();
}

async function type(driver, selector, value) {
  await driver.findElement(By.css(selector)).sendKeys(value);
}

(async function example() {
  try {
    console.log('> Connecting to the browser from Puppeteer...');

    // const browser = await puppeteer.launch({
    //   headless: false,
    //   // args: ["--remote-debugging-port==9999"],
    // });
    // await delay(1000);

    const browserURL = 'http://127.0.0.1:9222';
    const browser = await puppeteer.connect({ browserURL });
    const page = (await browser.pages())[0];

    await page.goto(Data.landingPageUrl);

    console.log(
      '> Clicking some element in the landing page by using Puppeteer...'
    );
    await page.waitForSelector(Selectors.someButtonInLandingPage);
    await page.click(Selectors.someButtonInLandingPage);

    console.log('> Delay for 3 seconds...');
    await delay(3);

    console.log('> Taking the second screenshot...');
    // await driver.takeScreenshot().then(async (image, err) => {
    //   await writeFile(
    //     "./screenshots/selenium-puppeteer-2.png",
    //     image,
    //     "base64",
    //     function (err) {
    //       console.log(err);
    //     }
    //   );
    // });
  } finally {
    // await driver.quit();
  }
})();
