/* eslint-disable @typescript-eslint/no-explicit-any */
import { findElement } from '@/helpers/automator';
import { scrapeCompetitorWithReact } from '../common/scrapeCompetitorWithReact';
import { delay } from '@growth-toolkit/common-utils';
import { exportCompetitors } from '../common/exportCompetitors';
import { foundProducts } from './foundProducts';
import { foundCompetitors } from './foundCompetitors';
import { foundDirectCompetitors } from './foundDirectCompetitors';

const sampleProduct = {
  campaignUrl: '',
  campaignUrlSignature: '',
  encodedCampaignUrl: '',
  featureIds: [
    '10f60c73-3636-440c-89fa-7be5d6722b68',
    '287572ed-c473-46ad-a814-7c7dd7c93b26',
    '2a19a42a-aaa2-464e-90a6-5cbcb1791759',
    '2d9b6736-d154-49ae-8a55-5177836b2719',
    '30ebf021-c2c3-403f-9ec5-7afa3a06453b',
    '362664d4-b526-4729-a1cc-7a8abc054415',
    '41820155-822b-444a-8761-d374f849442b',
    '46d88fd7-ac11-4590-99fe-dac4069f6e2c',
    '47fe3b08-6974-419a-aa89-5ecc6fba9a14',
    '4bc8cad3-3f11-45a1-85eb-368a68220d9e',
    '4d4f72ca-6584-4cb6-a58e-60950449e4ac',
    '554b6509-32cb-41ed-a6ae-7571e49eb6e5',
    '64c6667a-84e0-4130-9fd5-ae28d4020ad8',
    '704a45f8-bc8a-405c-abfc-ecd2e497dcc0',
    '7b8882ba-8459-4c05-87ea-19a2194340dd',
    '81f7efb4-f8b8-4879-bcf5-ab06f5046221',
    '82ce67d3-ac09-49d0-ae71-5e6401e3e26b',
    '856ab03e-a530-4ea9-bac6-968761c9b6c6',
    '8a17a42b-f4b2-478f-870b-2eb26d4080ca',
    '97efb0d3-9a23-4408-90d4-4db1e3830fbd',
    'a8e14035-1c8a-4185-a4f1-bf2357483cb0',
    'aef68b72-bd4c-4797-ae8c-4735512de81a',
    'af0f39e3-924c-4148-aaf6-b7006d31b336',
    'af69fe21-9e9b-42c2-bec8-d57062b9a057',
    'b9816f6d-006c-40e6-84db-34f93b74fba6',
    'bda17331-ff0d-4b56-bc6e-519ac7d25ccc',
    'c17d93b9-938a-481b-9b97-2d7619392ed5',
    'd5e0cbd2-ae88-477a-beac-989ac5815e69',
    'de7c5919-516a-4422-a4f9-963acfda0443',
    'dfdd9711-79c1-4f8c-82ae-4882c5b61377',
    'e4bc2f9e-b5cd-4591-9766-e206189cfe62',
    'fcd1199d-1f74-4104-b348-3de5a9f29347',
  ],
  media: [
    {
      caption: null,
      categoryId: '4266596b-22e8-4b33-9945-6219268d73c8',
      type: 'VIDEO',
      url: 'https://www.youtube.com/watch?v=wpI6XAteXOI',
      weight: 0,
    },
    {
      caption: 'Automation Testing',
      categoryId: '4266596b-22e8-4b33-9945-6219268d73c8',
      type: 'IMAGE',
      url: 'https://gdm-catalog-fmapi-prod.imgix.net/ProductScreenshot/2f14ee23-5d8b-422a-b06a-0ffc53fbc952.png',
      weight: 1,
    },
    {
      caption: 'Real Time Testing',
      categoryId: '4266596b-22e8-4b33-9945-6219268d73c8',
      type: 'IMAGE',
      url: 'https://gdm-catalog-fmapi-prod.imgix.net/ProductScreenshot/c175a201-0842-49b7-b786-3155eeb4bec9.png',
      weight: 2,
    },
    {
      caption: 'Integrations',
      categoryId: '4266596b-22e8-4b33-9945-6219268d73c8',
      type: 'IMAGE',
      url: 'https://gdm-catalog-fmapi-prod.imgix.net/ProductScreenshot/92ee38fb-bb15-4033-8194-07199f5c5f39.png',
      weight: 3,
    },
    {
      caption: 'Screenshot Testing',
      categoryId: '4266596b-22e8-4b33-9945-6219268d73c8',
      type: 'IMAGE',
      url: 'https://gdm-catalog-fmapi-prod.imgix.net/ProductScreenshot/dcf3ea66-318c-496a-8758-8009e789a15a.png',
      weight: 4,
    },
    {
      caption: 'Local Host Testing',
      categoryId: '4266596b-22e8-4b33-9945-6219268d73c8',
      type: 'IMAGE',
      url: 'https://gdm-catalog-fmapi-prod.imgix.net/ProductScreenshot/ac5eace6-bd24-437f-aa4b-dd2793355360.png',
      weight: 5,
    },
  ],
  product: {
    campaignId: '170732',
    id: '170732',
    rating: 4.6,
    slug: 'LambdaTest',
    totalReviews: 246,
  },
  showAsUpgraded: false,
  upcProduct: {
    id: '04d4f272-f472-4466-b43f-a7fc008b2ae0',
    logoUrl:
      'https://gdm-catalog-fmapi-prod.imgix.net/ProductLogo/2b3f1220-e535-4f4d-af26-86f62cb4d06f.png',
    longDescription:
      'LambdaTest’s test execution platform allows businesses to run both manual and automated tests of web and mobile apps across 3000+ different browsers, browser versions, operating system environments, and real devices. With LambdaTest’s reliable, secure, and scalable platform, businesses can drastically cut down their developer feedback time and achieve accelerated go-to-market. \n\nOver 600,000 users, 500+ enterprises, across 130+ countries, rely on LambdaTest for their test execution needs.',
    name: 'LambdaTest',
    shortDescription:
      'LambdaTest’s test execution platform helps run manual and automated tests across 3000+ combinations of browsers, OSs, and real devices.',
    websiteUrl: 'https://www.lambdatest.com',
  },
  vendor: {
    id: '2118297',
    isHitLimit: true,
    isPaused: true,
    isUpgraded: false,
    name: 'LambdaTest',
  },
};

async function hunt() {
  const competitors = await scrapeCompetitorWithReact<typeof sampleProduct>({
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
