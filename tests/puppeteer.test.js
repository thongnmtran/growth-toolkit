import puppeteer from 'puppeteer';
import { Data, Selectors } from './data.js';
import { delay } from '../utils.js';

let prevTime = Date.now();
function log(message, start) {
  const now = Date.now();
  console.log(
    `[${new Date(now).toISOString()}] ${message} (+${now - prevTime}ms)`
  );
  prevTime = now;
}

(async () => {
  log('Starting...');

  log('> Launching the browser...', true);
  const browser = await puppeteer.launch({ headless: false });
  log('> Browser launched.');

  log('> Opening a new page...', true);
  const page = await browser.newPage();
  log('> New page opened.');

  log('> Navigating to the login page...', true);
  await page.goto(Data.loginUrl);
  log('> Navigated to the login page.');

  log('> Typing username...', true);
  // await page.waitForSelector(Selectors.username);
  await page.type(Selectors.username, Data.username);
  log('> Username typed.');

  log('> Typing password...', true);
  await page.type(Selectors.password, Data.password);
  log('> Password typed.');

  log('> Clicking menu button...', true);
  await page.click(Selectors.menuButton);
  log('> Menu button clicked.');

  log('> Clicking login button...', true);
  await page.click(Selectors.loginButton);
  log('> Login button clicked.');

  log('> Navigating to the landing page...', true);
  await page.goto(Data.landingPageUrl);
  log('> Navigated to the landing page.');

  log('> Delay for 3 seconds...');
  await delay(3);

  log('> Page title: ' + (await page.title()));

  log('> Taking a screenshot...', true);
  await page.screenshot({ path: `./screenshots/puppeteer.png` });
  log('> Screenshot taken.');

  log('> Clicking some element in the landing page...', true);
  await page.click(Selectors.someButtonInLandingPage);
  log('> Element clicked.');

  log('> Delay for 3 seconds...');
  await delay(3);

  log('> Taking the second screenshot...', true);
  await page.screenshot({ path: `./screenshots/puppeteer-2.png` });
  log('> Second screenshot taken.');

  await browser.close();
})();
