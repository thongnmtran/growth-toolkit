import { NewRemoteObjectHelper } from '@growth-toolkit/common-transport';
import { SimilarwebScraperClient } from './SimilarwebScraperClient';
import { PageTransport } from '@/transports/PageTransport';

(async () => {
  const contentTransport = new PageTransport();

  const scraperClient = new SimilarwebScraperClient();
  NewRemoteObjectHelper.attachToServer(
    scraperClient,
    contentTransport,
    'scraper-client',
  );
})();
