import { SimilarwebScraper } from '@/background/SimilarwebScraper';
import { collectStatistics } from './collectStatistics';
import GlobalStore from '@/utils/GlobalStore';
import { SimiarwebSiteInfo } from './types/SimilarwebSiteInfo';
import { findElement } from '@/helpers/automator';

export class SimilarwebScraperClient extends SimilarwebScraper {
  override async collectClient(domain: string) {
    return collectStatistics(domain);
  }

  override collect(info: SimiarwebSiteInfo): void {
    if (info.domain) {
      GlobalStore.set(info.domain, info);
    }
  }

  override async isBlockedByCookies() {
    return !!findElement('.wa-limit-modal');
  }

  override async isNotFound() {
    return !!findElement('.error__search-container');
  }
}
