/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  exposeAPI,
  findElement,
  findElements,
  findReactProps,
  scrollToBottom,
} from '@/helpers/automator';
import { Competitor } from '../common/competitor-scraper-types';
import { get } from 'lodash';
import { delay } from '@growth-toolkit/common-utils';
import { copyExcelFile } from '@/utils/copyExcelFile';
import { foundProducts } from './foundProducts';
import { foundDirectCompetitors } from './foundDirectCompetitors';
import { foundCompetitors } from './foundCompetitors';
import { RawGartnerProduct } from './RawGartnerProduct';
import { PageTransport } from '@/transports/PageTransport';
import { GartnerScraper } from './GartnerScraper';
import { NewRemoteObjectHelper } from '@growth-toolkit/common-transport';

(async () => {
  const contentTransport = new PageTransport();

  const scraperClient = new GartnerScraper();
  NewRemoteObjectHelper.attachToServer(
    scraperClient,
    contentTransport,
    'gartner-scraper',
  );
  exposeAPI('scraper', scraperClient);
})();

async function hunt() {
  const competitors: Competitor[] = [];

  let curCompetitors = [];
  // const pageSize = 10;
  do {
    const from = competitors.length;
    const nodes = findElements(
      `#products-or-vendors-section > div > div:nth-child(n+${
        from + 1 + 1
      }):nth-child(-n+${57})`,
    );
    curCompetitors = nodes.map((node) => {
      const reactProps = findReactProps(node);
      const product: RawGartnerProduct = get(reactProps, 'children[1].props');

      return {
        name: product.products.name,
        url: `https://www.gartner.com/reviews/market/ai-augmented-software-testing-tools/vendor/worksoft/product/${product.products.seoName}`,
        company: product.vendor.name,
        reviews: [
          {
            name: 'Gartner',
            rating: product.ratings.averageRating,
            count: product.ratings.ratingsCount,
            url: `https://www.gartner.com/reviews/market/ai-augmented-software-testing-tools/vendor/worksoft/product/${product.products.seoName}`,
          },
        ],
      };
    });
    competitors.push(...curCompetitors);
    if (curCompetitors.length > 0) {
      console.log(curCompetitors);
      await scrollToBottom();
      const showMoreButton = findElement(
        '#products-or-vendors-section > div > div.pagination-section > button',
      );
      if (showMoreButton) {
        showMoreButton?.click();
        await delay('5s');
      } else {
        break;
      }
    }
    break;
  } while (curCompetitors.length > 0);

  console.log(competitors);
}

(window as any).hunt = hunt;

function copyCSV() {
  const data = foundProducts.map((competitor) => {
    const clone = {
      ...competitor,
      rating: competitor.reviews[0]?.rating,
      reviewsCount: competitor.reviews[0]?.count,
      reviewsUrl: competitor.reviews[0]?.url,
      reviews: undefined,
      // isTestingTool: foundTestingTools.includes(competitor.name),
      isCompetitor: foundCompetitors.includes(competitor.name),
      isDirectCompetitor: foundDirectCompetitors.includes(competitor.name),
    };
    delete clone.reviews;
    return clone;
  });
  console.log(data);
  copyExcelFile(data);
}
(window as any).copyCSV = copyCSV;
