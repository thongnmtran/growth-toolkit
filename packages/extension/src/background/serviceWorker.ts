/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChromeTransportServer } from '@/transports/ChromeTransportServer';
import { Fetcher } from '@/transports/Fetcher';
import { NewRemoteObjectHelper } from '@growth-toolkit/common-transport';
import { exposeAPI } from '@/helpers/automator';
import { initPopup } from './initPopup';
import { PopupAPI } from '@/@popup/PopupAPI';
import { LinkedInScraper } from '@/competitor-scrapers/linkedin/LinkedInScraper';
import { SimilarwebScraper } from '../competitor-scrapers/similarweb/SimilarwebScraper';
import { SimilarwebScraperClient } from '@/competitor-scrapers/similarweb/SimilarwebScraperClient';
import { ProductHuntScraper } from '@/competitor-scrapers/product-hunt/ProductHuntScraper';
import { G2Scraper } from '@/competitor-scrapers/g2/G2Scraper';

const transportServer = new ChromeTransportServer();

const popupAPI = new PopupAPI();
popupAPI.similarWebScraper = new SimilarwebScraper();
exposeAPI('popupAPI', popupAPI);

transportServer.addConnectionListener((connection) => {
  switch (connection.transport.name) {
    case 'client-script':
      NewRemoteObjectHelper.attachToServer(
        new Fetcher(),
        connection,
        'fetcher',
      );
      break;
    case 'popup':
      NewRemoteObjectHelper.attachToServer(
        popupAPI,
        connection,
        'popup-scraper',
      );
      break;
    case 'linkedin':
      {
        const scraper = NewRemoteObjectHelper.wrapClient(
          {} as LinkedInScraper,
          connection,
          'linkedin-scraper',
        );
        popupAPI.linkedInScraper = scraper;
      }
      break;
    case 'similarweb':
      {
        const scraper = NewRemoteObjectHelper.wrapClient(
          {} as SimilarwebScraperClient,
          connection,
          'similarweb-scraper-client',
        );
        popupAPI.similarWebScraper.client = scraper;
      }
      break;
    case 'producthunt':
      {
        const scraper = NewRemoteObjectHelper.wrapClient(
          {} as ProductHuntScraper,
          connection,
          'producthunt-scraper',
        );
        popupAPI.productHuntScraper = scraper;
      }
      break;
    case 'g2':
      {
        const scraper = NewRemoteObjectHelper.wrapClient(
          {} as G2Scraper,
          connection,
          'g2-scraper',
        );
        popupAPI.g2Scraper = scraper;
      }
      break;
  }
});

transportServer.listen();

initPopup();

console.log('Hello');
