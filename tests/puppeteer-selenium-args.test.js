import puppeteer from 'puppeteer';
import { Data, Selectors } from './data';
import { delay } from '../utils';

const seleniumChromeArgs = [
  '--allow-pre-commit-input',
  '--disable-background-networking',
  '--disable-backgrounding-occluded-windows',
  '--disable-client-side-phishing-detection',
  '--disable-default-apps',
  '--disable-hang-monitor',
  '--disable-popup-blocking',
  '--disable-prompt-on-repost',
  '--disable-sync',
  '--enable-automation',
  '--enable-logging',
  '--log-level=0',
  '--no-first-run',
  '--no-service-autorun',
  '--password-store=basic',
  '--remote-debugging-port=0',
  '--test-type=webdriver',
  '--use-mock-keychain',
];

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: [...seleniumChromeArgs],
  });
  const page = await browser.newPage();

  await page.goto(Data.loginUrl);

  console.log(`> Page title: "${await page.title()}"`);

  console.log('> Typing username...');
  await page.waitForSelector(Selectors.username);
  await page.type(Selectors.username, Data.username);

  console.log('> Typing password...');
  await page.waitForSelector(Selectors.password);
  await page.type(Selectors.password, Data.password);

  console.log('> Clicking login button...');
  await page.waitForSelector(Selectors.loginButton);
  await page.click(Selectors.loginButton);

  console.log('> Navigating to the landing page...');
  await page.goto(Data.landingPageUrl);

  console.log('> Delay for 3 seconds...');
  await delay(3);

  console.log('> Page title: ' + (await page.title()));

  console.log('> Taking a screenshot...');
  await page.screenshot({ path: `./screenshots/puppeteer-selenium-args.png` });

  console.log('> Clicking some element in the landing page...');
  await page.waitForSelector(Selectors.someButtonInLandingPage);
  await page.click(Selectors.someButtonInLandingPage);

  console.log('> Delay for 3 seconds...');
  await delay(3);

  console.log('> Taking the second screenshot...');
  await page.screenshot({
    path: `./screenshots/puppeteer-selenium-args-2.png`,
  });

  await browser.close();
})();
