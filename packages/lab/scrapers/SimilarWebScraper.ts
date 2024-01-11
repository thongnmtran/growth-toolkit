import { openBrowser } from '../helpers/browser-utils';

async function run() {
  const browser = await openBrowser();
  const page = await browser.newPage();

  await page.goto('https://www.similarweb.com/website/google.com/#overview');
}

run();
