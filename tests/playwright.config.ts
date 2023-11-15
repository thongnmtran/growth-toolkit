import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  use: {
    headless: false,
  },
  timeout: 999999999,
};
export default config;