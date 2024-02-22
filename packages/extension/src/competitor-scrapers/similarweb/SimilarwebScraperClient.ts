import { collectStatistics } from './collectStatistics';
import GlobalStore from '@/utils/GlobalStore';
import { SimilarWebSiteInfo } from './types/SimilarwebSiteInfo';
import { findElement } from '@/helpers/automator';

export class SimilarwebScraperClient {
  async scrape(domain?: string) {
    return collectStatistics(domain);
  }

  save(info: SimilarWebSiteInfo): void {
    if (info.domain) {
      GlobalStore.set(info.domain, info);
    }
  }

  async isBlockedByCookies() {
    return !!findElement('.wa-limit-modal');
  }

  async isNotFound() {
    return !!findElement('.error__search-container');
  }
}
