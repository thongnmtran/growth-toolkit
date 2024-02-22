import { NewRemoteObjectHelper } from '@growth-toolkit/common-transport';
import { PageTransport } from '@/transports/PageTransport';
import { exposeAPI } from '@/helpers/automator';
import { SimilarwebScraperClient } from './SimilarwebScraperClient';

(async () => {
  const contentTransport = new PageTransport();

  const scraperClient = new SimilarwebScraperClient();
  NewRemoteObjectHelper.attachToServer(
    scraperClient,
    contentTransport,
    'similarweb-scraper-client',
  );
  exposeAPI('scraper', scraperClient);
})();
