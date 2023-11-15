import { Builder, Browser, By } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { delay } from '../utils';
import { mkdir, writeFile } from 'fs/promises';
import { Data, Selectors } from './data';

async function click(driver, selector) {
  await driver.findElement(By.css(selector)).click();
}

async function type(driver, selector, value) {
  await driver.findElement(By.css(selector)).sendKeys(value);
}

(async function example() {
  const options = new chrome.Options();

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
        './screenshots/selenium.png',
        image,
        'base64',
        function (err) {
          console.log(err);
        }
      );
    });

    console.log('> Clicking some element in the landing page...');
    await click(driver, Selectors.someButtonInLandingPage);

    console.log('> Delay for 3 seconds...');
    await delay(3);

    console.log('> Taking the second screenshot...');
    await driver.takeScreenshot().then(async (image, err) => {
      await writeFile(
        './screenshots/selenium-2.png',
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
