import { SimilarwebScraper } from '@/background/SimilarwebScraper';
import { collectStatistics } from './collectStatistics';

export class SimilarwebScraperClient extends SimilarwebScraper {
  override async collectClient() {
    console.log('> collectClient');
    return collectStatistics();
  }
}
