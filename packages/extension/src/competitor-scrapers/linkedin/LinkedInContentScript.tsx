import {
  NewRemoteObjectHelper,
  asSyncTransport,
} from '@growth-toolkit/common-transport';
import { LinkedInScraper } from './LinkedInScraper';
import { ChromeRuntimeTransport } from '@/transports/ChromeRuntimeTransport';
import { exposeAPI } from '@/helpers/automator';

(async () => {
  const backgroundTransport = asSyncTransport(
    new ChromeRuntimeTransport(chrome.runtime.id, 'linkedin'),
  );

  const scraper = new LinkedInScraper();
  NewRemoteObjectHelper.attachToServer(
    scraper,
    backgroundTransport,
    'linkedin-scraper',
  );
  exposeAPI('scraper', scraper);
})();
