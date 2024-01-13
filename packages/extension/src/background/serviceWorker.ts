/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChromeTransportServer } from '@/transports/ChromeTransportServer';
import { Fetcher } from '@/transports/Fetcher';
import { NewRemoteObjectHelper } from '@growth-toolkit/common-transport';
import { SimilarwebScraper } from './SimilarwebScraper';
import { exposeAPI } from '@/helpers/automator';

const transportServer = new ChromeTransportServer();

const scraper = new SimilarwebScraper();
exposeAPI('scraper', scraper);

transportServer.addConnectionListener((connection) => {
  NewRemoteObjectHelper.attachToServer(new Fetcher(), connection, 'fetcher');

  const scraperClient = NewRemoteObjectHelper.wrapClient(
    {} as SimilarwebScraper,
    connection,
    'scraper-client',
  );
  scraper.client = scraperClient;
  NewRemoteObjectHelper.attachToServer(scraper, connection, 'scraper');
});

transportServer.listen();

console.log('Hello');
