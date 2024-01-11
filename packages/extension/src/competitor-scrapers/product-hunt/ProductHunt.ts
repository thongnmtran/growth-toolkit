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
import { foundProducts } from './foundProducts';
import { copyExcelFile } from '@/utils/copyExcelFile';
import { foundCompetitors } from './foundCompetitors';
import { foundDirectCompetitors } from './foundDirectCompetitors';
import { foundTestingTools } from './foundTestingTools';

const sampleProductHuntProduct = {
  __typename: 'Product',
  id: '554225',
  description:
    "Introducing SpeedVitals, the next generation of web performance testing. SpeedVitals is a powerful website testing tool aimed at improving Core Web Vitals. It provides performance insights to help improve your website's speed.",
  reviewsCount: 4,
  reviewsRating: 5,
  slug: 'speedvitals',
  isMaker: false,
  isViewerTeamMember: null,
  stacksCount: 14,
  stackers: {
    __typename: 'UserConnection',
    edges: [
      {
        __typename: 'UserEdge',
        node: {
          __typename: 'User',
          id: '3832544',
          name: 'Kashish Kumawat',
          username: 'kashishkumawat',
          avatarUrl:
            'https://ph-avatars.imgix.net/3832544/7a26ea55-97dd-4a48-b4f1-2a783d066d20',
        },
      },
      {
        __typename: 'UserEdge',
        node: {
          __typename: 'User',
          id: '2820589',
          name: 'Rohan Rajpal',
          username: 'rohanrajpal',
          avatarUrl:
            'https://ph-avatars.imgix.net/2820589/a9b72a24-bbcd-44d7-aae2-099e6c62ebf0',
        },
      },
      {
        __typename: 'UserEdge',
        node: {
          __typename: 'User',
          id: '3510967',
          name: 'Abhishek Gupta',
          username: 'abhishek_gupta15',
          avatarUrl:
            'https://ph-avatars.imgix.net/3510967/82e59ba3-0211-4f7c-95df-87e481fe6e4c',
        },
      },
    ],
  },
  websiteUrl: 'https://speedvitals.com',
  name: 'SpeedVitals',
  logoUuid: 'e708318e-f9e0-4b97-a917-c263a46bf0e0.png',
  isNoLongerOnline: false,
  isStacked: false,
};

type ProductHuntProduct = typeof sampleProductHuntProduct;

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
      await scrollToBotton();
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
