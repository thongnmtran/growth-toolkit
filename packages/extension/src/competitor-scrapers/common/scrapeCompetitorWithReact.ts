/* eslint-disable @typescript-eslint/no-explicit-any */
import { findElements, findReactProps } from '@/helpers/automator';
import { Competitor } from './competitor-scraper-types';
import { get } from 'lodash';

export type ScrapeWithReactParams<ProductType> = {
  nodeSelector?: string;
  reactProductPath?: string;
  productCollector?: (reactProps: any) => ProductType | undefined;
  productScraper?: (node: HTMLElement) => Promise<ProductType | undefined>;
  rawProducts?: ProductType[];
  nextProvider?: () => Promise<void>;
  productToCompetitor: (product: ProductType) => Competitor | undefined;
};

export async function scrapeCompetitorWithReact<ProductType>(
  params: ScrapeWithReactParams<ProductType>,
) {
  const competitors: Competitor[] = [];
  const {
    nodeSelector,
    reactProductPath,
    productCollector,
    productScraper,
    rawProducts,
    productToCompetitor,
    nextProvider,
  } = params;

  let pageCompetitors: Competitor[] = [];
  try {
    do {
      pageCompetitors = [];
      let products: ProductType[] = [];

      if (rawProducts) {
        products = rawProducts;
      } else if (nodeSelector) {
        const nodes = findElements(nodeSelector);
        for (const node of nodes) {
          const reactProps = findReactProps(node);
          const product = reactProductPath
            ? (get(reactProps, reactProductPath) as ProductType)
            : productCollector
              ? productCollector(reactProps)
              : await productScraper?.(node);
          if (!product) {
            continue;
          }
          products.push(product);
        }
      }

      for (const product of products) {
        const competitor = productToCompetitor(product);
        if (
          !competitor ||
          competitors.some(
            (competitorI) => competitorI.name === competitor.name,
          )
        ) {
          continue;
        }
        pageCompetitors.push(competitor);
        competitors.push(competitor);
      }

      console.log(pageCompetitors);

      if (nextProvider) {
        await nextProvider();
      } else {
        break;
      }
    } while (pageCompetitors.length > 0);
  } catch (error) {
    console.log(error);
  }

  return competitors;
}
