/* eslint-disable @typescript-eslint/no-explicit-any */
import { findElement } from '@/helpers/automator';
import { scrapeCompetitorWithReact } from '../common/scrapeCompetitorWithReact';
import { delay } from '@growth-toolkit/common-utils';
import { exportCompetitors } from '../common/exportCompetitors';
import { foundProducts } from './foundProducts';
import { foundCompetitors } from './foundCompetitors';
import { foundDirectCompetitors } from './foundDirectCompetitors';
import { RawCapterraProduct } from './CapterraProduct';

async function hunt() {
  const competitors = await scrapeCompetitorWithReact<RawCapterraProduct>({
    nodeSelector:
      '#__capterra__ > div.antialiased > div > div.sb.screen-container.lg\\:my-3xl.xl\\:w-screen-xl.px-md.my-4xl.flex.flex-col-reverse.lg\\:flex-row-reverse.lg\\:items-start.xl\\:px-0 > div.lg\\:ml-xl.gap-xl.flex.flex-1.flex-col > div:nth-child(1) > div',
    reactProductPath: 'children[1].props.product',
    productToCompetitor: (product) => ({
      name: product.upcProduct.name,
      description: product.upcProduct.shortDescription,
      url: product.upcProduct.websiteUrl,
      company: product.vendor.name,
      reviews: [
        {
          name: 'Capterra',
          rating: product.product.rating,
          count: product.product.totalReviews,
          url: `https://www.capterra.com/p/${product.product.id}/${product.product.slug}/`,
        },
      ],
    }),
    nextProvider: async () => {
      const showMoreButton = findElement(
        '[data-testid="page-item-section"] [aria-label="chevron-right"]',
      );
      if (!showMoreButton) {
        throw 'No more pages';
      }
      showMoreButton?.click();
      await delay('5s');
    },
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
