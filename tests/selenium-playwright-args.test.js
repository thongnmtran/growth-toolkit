import { Builder, Browser, By } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { delay } from '../utils';
import { mkdir, writeFile } from 'fs/promises';
import { Data, Selectors } from './data';

/**
 * Selenium
 * "C:\Program Files\Google\Chrome\Application\chrome.exe" --allow-pre-commit-input --disable-background-networking --disable-backgrounding-occluded-windows --disable-client-side-phishing-detection --disable-default-apps --disable-hang-monitor --disable-popup-blocking --disable-prompt-on-repost --disable-sync --enable-automation --enable-logging --log-level=0 --no-first-run --no-service-autorun --password-store=basic --remote-debugging-port=0 --test-type=webdriver --use-mock-keychain --user-data-dir="C:\Users\THONG~1.TRA\AppData\Local\Temp\scoped_dir16476_1469382703" --flag-switches-begin --flag-switches-end data:,
 */

/**
 * [Playwright]
 * "C:\Users\thong.tran\AppData\Local\ms-playwright\chromium-1067\chrome-win\chrome.exe" --disable-field-trial-config --disable-background-networking --enable-features=NetworkService,NetworkServiceInProcess --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-extensions --disable-features=ImprovedCookieControls,LazyFrameLoading,GlobalMediaControls,DestroyProfileOnBrowserClose,MediaRouter,DialMediaRouteProvider,AcceptCHFrame,AutoExpandDetailsElement,CertificateTransparencyComponentUpdater,AvoidUnnecessaryBeforeUnloadCheckSync,Translate --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --force-color-profile=srgb --metrics-recording-only --no-first-run --enable-automation --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --no-sandbox --disable-notifications --disable-infobars --disable-application-cache --disable-extensions-except="C:\Users\thong.tran\.pandoraboz\extensions\Google Authenticator" --load-extension="C:\Users\thong.tran\.pandoraboz\extensions\Google Authenticator" --user-data-dir="C:\Users\thong.tran\.pandoraboz\profiles" --remote-debugging-pipe --flag-switches-begin --flag-switches-end --file-url-path-alias="/gen=C:\Users\thong.tran\AppData\Local\ms-playwright\chromium-1067\chrome-win\gen" about:blank
 */

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

const playwrightChromeArgs = [
  '--disable-field-trial-config',
  '--disable-background-networking',
  '--enable-features=NetworkService,NetworkServiceInProcess',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-back-forward-cache',
  '--disable-breakpad',
  '--disable-client-side-phishing-detection',
  '--disable-component-extensions-with-background-pages',
  '--disable-component-update',
  '--no-default-browser-check',
  '--disable-default-apps',
  '--disable-dev-shm-usage',
  '--disable-extensions',
  '--disable-features=ImprovedCookieControls,LazyFrameLoading,GlobalMediaControls,DestroyProfileOnBrowserClose,MediaRouter,DialMediaRouteProvider,AcceptCHFrame,AutoExpandDetailsElement,CertificateTransparencyComponentUpdater,AvoidUnnecessaryBeforeUnloadCheckSync,Translate',
  '--allow-pre-commit-input',
  '--disable-hang-monitor',
  '--disable-ipc-flooding-protection',
  '--disable-popup-blocking',
  '--disable-prompt-on-repost',
  '--disable-renderer-backgrounding',
  '--force-color-profile=srgb',
  '--metrics-recording-only',
  '--no-first-run',
  '--enable-automation',
  '--password-store=basic',
  '--use-mock-keychain',
  '--no-service-autorun',
  '--export-tagged-pdf',
  '--no-sandbox',
  '--disable-notifications',
  '--disable-infobars',
  '--disable-application-cache',
  // "--remote-debugging-pipe",
  // "--flag-switches-begin",
  // "--flag-switches-end",
  // '--file-url-path-alias="/gen=C:\\Users\\thong.tran\\AppData\\Local\\ms-playwright\\chromium-1067\\chrome-win\\gen"',
  'about:blank',
];

const playwrightDiffArgs = playwrightChromeArgs.filter(
  (argI) => !seleniumChromeArgs.includes(argI)
);
console.log('> playwrightDiffArgs:', playwrightDiffArgs);

const seleniumDiffArgs = seleniumChromeArgs.filter(
  (argI) => !playwrightChromeArgs.includes(argI)
);
console.log('> seleniumDiffArgs:', seleniumDiffArgs);

async function click(driver, selector) {
  await driver.findElement(By.css(selector)).click();
}

async function type(driver, selector, value) {
  await driver.findElement(By.css(selector)).sendKeys(value);
}

(async function example() {
  const options = new chrome.Options();
  options.addArguments(...playwrightDiffArgs);

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
        './screenshots/selenium-playwright-args.png',
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
        './screenshots/selenium-playwright-args-2.png',
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
