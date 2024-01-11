/* eslint-disable @typescript-eslint/no-explicit-any */
import { scrapeCompetitorWithReact } from '../common/scrapeCompetitorWithReact';
import { exportCompetitors } from '../common/exportCompetitors';
import { foundProducts } from './foundProducts';
import { foundCompetitors } from './foundCompetitors';
import { foundDirectCompetitors } from './foundDirectCompetitors';
import { rawProducts } from './rawProducts';
import { Unpacked } from '@growth-toolkit/common-utils';

async function fetchProducts(from = 0, size = 222) {
  const res = await fetch('https://www.trustradius.com/api/v1/search', {
    headers: {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'en-US,en;q=0.9,vi;q=0.8',
      'content-type': 'application/json;charset=UTF-8',
      'csrf-token': 'SSNKPRdV-PRcpWQt1bKLQSd6yinu_N9dVkq8',
      'device-memory': '8',
      downlink: '3.25',
      ect: '4g',
      rtt: '150',
      'sec-ch-ua':
        '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'viewport-width': '1014',
      'x-newrelic-id': 'UwYAVFJVGwcBVFVTDgI=',
    },
    referrer: 'https://www.trustradius.com/automation-testing?f=0',
    referrerPolicy: 'strict-origin-when-cross-origin',
    body: `{"minScore":0.1,"singleResultSize":${size},"sort":"reviews","multiResultSize":3,"from":${from},"size":${size},"maxTypeSize":3,"overrides":{"queryTypes":["product"],"category":"5f6e8c119d272f001c5f0359","includeAggregations":["companySizeGroup","integrations","supportedFeatures","hasPricing"]}}`,
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
  });
  const data = await res.json();
  return data.response.hits;
}

async function hunt() {
  let rawProductsz = null;

  if (!rawProductsz) {
    rawProductsz = [
      ...(await fetchProducts(0, 100)),
      ...(await fetchProducts(100, 200)),
      ...(await fetchProducts(200, 222)),
    ];
  }

  const competitors = await scrapeCompetitorWithReact<
    Unpacked<typeof rawProducts>
  >({
    rawProducts: rawProductsz,
    productToCompetitor: ({ _source: product }) => ({
      name: product.shortName,
      description: product.description,
      url: product.homepage,
      company: product.vendor.name,
      reviews: [
        {
          name: 'TrustRadius',
          rating: product.rating.avg,
          count: product.rating.count,
          url: `https://www.trustradius.com/products/${product.slug}/reviews`,
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
