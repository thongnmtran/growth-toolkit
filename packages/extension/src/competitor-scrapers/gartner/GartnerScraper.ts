import { findElement, setText } from '@/helpers/automator';
import { delay } from '@growth-toolkit/common-utils';

export class GartnerScraper {
  async search(name: string) {
    await setText('input#universalSearchBox', name);
    await delay('3s');
    const firstProductResult = await findElement<HTMLAnchorElement>(
      `//*[contains(@class, "searchResultItem")]//a[contains(translate(., "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "${name.toLocaleLowerCase()}")]`,
    );
    if (firstProductResult) {
      return firstProductResult.href;
    }
    return undefined;
  }

  async scrape() {
    return {};
  }
}
