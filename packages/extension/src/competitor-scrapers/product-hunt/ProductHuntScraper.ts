import { collectReactProps, findElement, setText } from '@/helpers/automator';
import { CommonProductInfo } from '../common/CommonProductInfo';
import { delay } from '@growth-toolkit/common-utils';

export class ProductHuntScraper {
  async scrape(): Promise<CommonProductInfo | undefined> {
    const rawProduct = collectReactProps(
      '[class*="styles_thumbnailWrapper"]',
      'children.props.product',
    );
    if (!rawProduct) {
      return;
    }
    return {
      rating: rawProduct.reviewsRating,
      reviewsCount: rawProduct.reviewsCount,
    };
  }

  async search(name: string) {
    const searchButton = await findElement(
      'input[data-test="header-search-input"]',
    );
    searchButton?.click();

    await delay('500ms');

    await setText('input[data-test="spotlight-search-input"]', name);
    await delay('3s');
    const firstProductResult = await findElement<HTMLAnchorElement>(
      `//*[contains(@data-test, "spotlight-result-product-") and contains(translate(., "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "${name.toLocaleLowerCase()}") and contains(., "Product")]`,
    );
    if (firstProductResult) {
      return firstProductResult.href;
    }

    const firstLaunchResult = await findElement<HTMLAnchorElement>(
      `//*[contains(@data-test, "spotlight-result-post-") and contains(translate(., "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "${name.toLocaleLowerCase()}") and contains(., "Launch")]`,
    );
    if (firstLaunchResult) {
      return firstLaunchResult.href;
    }
    return undefined;
  }
}
