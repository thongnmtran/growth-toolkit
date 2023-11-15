import { test } from '@playwright/test';
import { Data, Selectors } from './data';
import { delay } from './utils';

test('Page Screenshot', async ({ page }) => {
  await page.goto(Data.loginUrl);

  console.log(`> Page title: "${await page.title()}"`);

  console.log('> Typing username...');
  await page.type(Selectors.username, Data.username);

  console.log('> Typing password...');
  await page.type(Selectors.password, Data.password);

  console.log('> Clicking login button...');
  await page.click(Selectors.loginButton);

  console.log('> Navigating to the landing page...');
  await page.goto(Data.landingPageUrl);

  console.log('> Delay for 3 seconds...');
  await delay(3);

  console.log('> Page title: ' + (await page.title()));

  console.log('> Taking a screenshot...');
  await page.screenshot({ path: `./screenshots/playwwright.png` });

  console.log('> Clicking some element in the landing page...');
  await page.click(Selectors.someButtonInLandingPage);

  console.log('> Delay for 3 seconds...');
  await delay(3);

  console.log('> Taking the second screenshot...');
  await page.screenshot({ path: `./screenshots/playwwright-2.png` });
});
