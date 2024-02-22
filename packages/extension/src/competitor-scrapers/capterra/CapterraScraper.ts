import { collectReactProps } from '@/helpers/automator';
import { CapterraProductInfo } from './CapterraProductInfo';

export class CapterraScraper {
  async scrape(): Promise<CapterraProductInfo> {
    const product = {} as CapterraProductInfo;
    const rawProduct = collectReactProps(
      '[class*="styles_thumbnailWrapper"]',
      'children.props.product',
    );
    product.rating = rawProduct.reviewsRating;
    product.reviewsCount = rawProduct.reviewsCount;
    return product;
  }
}
