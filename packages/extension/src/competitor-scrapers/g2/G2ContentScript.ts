/* eslint-disable @typescript-eslint/no-explicit-any */
import { scrapeCompetitorWithReact } from '../common/scrapeCompetitorWithReact';
import { exportCompetitors } from '../common/exportCompetitors';
import { foundProducts } from './foundProducts';
import { foundCompetitors } from './foundCompetitors';
import { foundDirectCompetitors } from './foundDirectCompetitors';
import {
  exposeAPI,
  findElement,
  getElementAttr,
  getElementText,
} from '@/helpers/automator';
import {
  NewRemoteObjectHelper,
  asSyncTransport,
} from '@growth-toolkit/common-transport';
import { ChromeRuntimeTransport } from '@/transports/ChromeRuntimeTransport';
import { G2Scraper } from './G2Scraper';

(async () => {
  const backgroundTransport = asSyncTransport(
    new ChromeRuntimeTransport(chrome.runtime.id, 'g2'),
  );

  const scraperClient = new G2Scraper();
  NewRemoteObjectHelper.attachToServer(
    scraperClient,
    backgroundTransport,
    'g2-scraper',
  );
  exposeAPI('scraper', scraperClient);
})();

type G2Product = {
  name: string;
  description: string;
  homepage: string;
  rating: number;
  reviewsCount: number;
};

async function hunt() {
  const competitors = await scrapeCompetitorWithReact<G2Product>({
    nodeSelector: '[data-ordered-events-item="products"]',
    productScraper: async (node) => {
      const name = getElementText('.product-card__product-name a[href]', node);
      const homepage = getElementAttr(
        '.product-card__product-name a[href]',
        'href',
        node,
      );
      const rating = +getElementText(
        '.product-card__info .link--header-color .fw-semibold:nth-child(1)',
        node,
      );
      const reviewsCount = +getElementText('.product-card__info .px-4th', node)
        .slice(1, -1)
        .replace(',', '');

      const showMoreText = getElementText(
        '.product-listing__paragraph a[href]',
        node,
      );
      if (showMoreText === 'Show More') {
        const showMore = findElement(
          '.product-listing__paragraph a[href]',
          node,
        );
        showMore?.click();
        const showLessText = getElementText(
          '.product-listing__paragraph a[href]',
          node,
        );
        console.log('> showLessText: ', showLessText);
      }
      const description = getElementText(
        '.show-for-large .product-listing__paragraph',
        node,
      ).slice(0, -10);

      return {
        name,
        description,
        homepage,
        rating,
        reviewsCount,
      };
    },
    productToCompetitor: (product) => ({
      name: product.name,
      description: product.description,
      url: product.homepage,
      reviews: [
        {
          name: 'G2',
          rating: product.rating,
          count: product.reviewsCount,
          url: product.homepage,
        },
      ],
    }),
  });

  console.log(competitors);
}

(window as any).hunt = hunt;

(window as any).copyCSV = () => {
  exportCompetitors({
    competitors: foundProducts,
    foundCompetitors: foundCompetitors,
    foundDirectCompetitors: foundDirectCompetitors,
  });
};
