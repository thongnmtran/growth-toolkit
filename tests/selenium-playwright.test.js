import { Builder, Browser, By } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { delay } from '../utils';
import { mkdir, writeFile } from 'fs/promises';
import { Data, Selectors } from './data';
import playwright from 'playwright';

async function click(driver, selector) {
  await driver.findElement(By.css(selector)).click();
}

async function type(driver, selector, value) {
  await driver.findElement(By.css(selector)).sendKeys(value);
}

(async function example() {
  const options = new chrome.Options();
  options.addArguments('--remote-debugging-port=9222');

  let driver = await new Builder()
    .forBrowser(Browser.CHROME)
    .setChromeOptions(options)
    .build();

  try {
    await driver.get(Data.loginUrl);

    console.log('> Page title: ' + (await driver.getTitle()));

    console.log('> Typing username...');
    await type(driver, Selectors.username, Data.username);

    console.log('> Typing password...');
    await type(driver, Selectors.password, Data.password);

    console.log('> Clicking login button...');
    await click(driver, Selectors.loginButton);

    console.log('> Navigating to the landing page...');
    await driver.get(Data.landingPageUrl);

    console.log('> Delay for 3 seconds...');
    await delay(3);

    console.log('> Page title: ' + (await driver.getTitle()));

    console.log('> Taking a screenshot...');
    await mkdir('./screenshots/', { recursive: true });
    await driver.takeScreenshot().then(async (image, err) => {
      await writeFile(
        './screenshots/selenium-playwright.png',
        image,
        'base64',
        function (err) {
          console.log(err);
        }
      );
    });

    console.log('> Connecting to the browser from Playwright...');
    const browserURL = 'http://127.0.0.1:9222';
    const browser = await playwright.chromium.connectOverCDP(browserURL);
    const context = browser.contexts()[0];
    const page = context.pages()[0];

    console.log(
      '> Clicking some element in the landing page by using Playwright...'
    );
    await page.click(Selectors.someButtonInLandingPage);

    console.log('> Delay for 3 seconds...');
    await delay(3);

    console.log('> Taking the second screenshot...');
    await driver.takeScreenshot().then(async (image, err) => {
      await writeFile(
        './screenshots/selenium-playwright-2.png',
        image,
        'base64',
        function (err) {
          console.log(err);
        }
      );
    });
  } finally {
    await driver.quit();
  }
})();
