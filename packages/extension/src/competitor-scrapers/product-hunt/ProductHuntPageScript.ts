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
import { foundProducts } from './foundProducts';
import { copyExcelFile } from '@/utils/copyExcelFile';
import { foundCompetitors } from './foundCompetitors';
import { foundDirectCompetitors } from './foundDirectCompetitors';
import { foundTestingTools } from './foundTestingTools';
import { ProductHuntProduct } from './ProductHuntProduct';
import { ProductHuntScraper } from './ProductHuntScraper';
import { PageTransport } from '@/transports/PageTransport';
import { NewRemoteObjectHelper } from '@growth-toolkit/common-transport';

(async () => {
  const contentTransport = new PageTransport();

  const scraperClient = new ProductHuntScraper();
  NewRemoteObjectHelper.attachToServer(
    scraperClient,
    contentTransport,
    'producthunt-scraper',
  );
  exposeAPI('scraper', scraperClient);
})();

async function hunt() {
  const competitors: Competitor[] = [];

  let curCompetitors = [];
  const pageSize = 10;
  do {
    const from = competitors.length;
    const nodes = findElements(
      `#__next > div:nth-child(3) > main > div.flex.direction-column.pb-12 > div:nth-child(n+${
        from + 1
      }):nth-child(-n+${from + pageSize})`,
    );
    curCompetitors = nodes.map((node) => {
      const reactProps = findReactProps(node);
      const product: ProductHuntProduct = get(
        reactProps,
        'children[2].props.product',
      );

      return {
        name: product.name,
        description: product.description,
        url: product.websiteUrl,
        company: product.name,
        reviews: [
          {
            name: 'Product Hunt',
            count: product.reviewsCount,
            rating: product.reviewsRating,
            url: `https://www.producthunt.com/products/${product.slug}/reviews`,
          },
        ],
      };
    });
    competitors.push(...curCompetitors);
    if (curCompetitors.length > 0) {
      console.log(curCompetitors);
      await scrollToBottom();
      const showMoreButton = findElement(
        '#__next > div:nth-child(3) > main > div.flex.direction-column.pb-12 > button',
      );
      showMoreButton?.click();
      await delay('5s');
    }
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
      company: undefined,
      isTestingTool: foundTestingTools.includes(competitor.name),
      isCompetitor: foundCompetitors.includes(competitor.name),
      isDirectCompetitor: foundDirectCompetitors.includes(competitor.name),
    };
    delete clone.reviews;
    delete clone.company;
    return clone;
  });
  console.log(data);
  copyExcelFile(data);
}
(window as any).copyCSV = copyCSV;
