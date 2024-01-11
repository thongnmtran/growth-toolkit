/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  findElement,
  findElements,
  findReactProps,
  scrollToBotton,
} from '@/helpers/automator';
import { Competitor } from '../common/competitor-scraper-types';
import { get } from 'lodash';
import { delay } from '@growth-toolkit/common-utils';
import { copyExcelFile } from '@/utils/copyExcelFile';
import { foundProducts } from './foundProducts';
import { foundDirectCompetitors } from './foundDirectCompetitors';
import { foundCompetitors } from './foundCompetitors';

const sampleGartnerProduct = {
  type: 'product',
  products: {
    seqId: 137336,
    name: 'axe DevTools',
    seoName: 'axe-devtools',
    alternatives: [],
  },
  vendor: {
    id: 'ba302bcf-5ff4-417f-b4dc-63b9e60d21b1',
    seqId: 65190,
    name: 'Deque Systems',
    seoName: 'deque-systems',
  },
  marketSEOName: 'ai-augmented-software-testing-tools',
  marketName: 'AI-Augmented Software-Testing Tools',
  vendorsConsidered: [],
  review: {
    reviewId: 4563776,
    reviewHeadline:
      'Axe Pro Devtools is a must-have for website accessibility auditing',
    reviewSummary:
      'When it comes to auditing sites for accessibility, Axe (Pro) Devtools is one of the most efficient, light-weight, and reliable tools (plug-ins) out there.  The information provided for individual accessibility issues has time and time again proven to be crucial to delivering an accessible product to our customer(s).  ',
    reviewDate: 1674127021609,
    deploymentRegion: 'North America',
    partnerReview: false,
  },
  ratings: {
    averageRating: 4,
    ratingsCount: 2,
    overallRating: {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 2,
      '5': 0,
    },
  },
  logoUrl: '/pi/vendorimages/deque-systems_1633119432327.png',
  isZeroRating: false,
  zeroRatingsText: 'Be the first to write a review',
  writeAReviewText: 'Write a Review',
  noRatingsData: false,
  ccFlag: false,
  isPartnerReview: false,
  hasProfile: false,
  source: 'market-page',
};

type GartnerProduct = typeof sampleGartnerProduct;

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
      const product: GartnerProduct = get(reactProps, 'children[1].props');

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
      await scrollToBotton();
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
