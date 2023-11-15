import { execFile } from 'child_process';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer';
import { delay } from '../../common/utils/time-utils';
import { normalizePath } from '../../common/utils/string-utils';

export async function openBrowser() {
  const profile = normalizePath(resolve('./profiles/Default'));
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: profile,
    args: ['--disable-infobars', '--test-type=gpu', '--window-size=1000,800'],
    ignoreDefaultArgs: ['--enable-automation'],
  });
  return browser;
}

export async function openUndetectedBrowser() {
  const port = 44444;
  const profile = normalizePath(resolve('./profiles/Default'));
  const chromePath = normalizePath(
    'C:/Users/thong.tran/.cache/puppeteer/chrome/win64-116.0.5845.96/chrome-win64/chrome.exe'
  );
  const args = [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
  ];
  const command = `${chromePath}`;
  const process = execFile(command, args, {
    // stdio: ['inherit', 'inherit', 'inherit'],
  });

  process.once('spawn', () => {
    console.log('Chrome spawned');
  });

  await delay(5);

  const browserURL = `http://127.0.0.1:${port}`;
  const browser = await puppeteer.connect({ browserURL });
  return browser;
}
