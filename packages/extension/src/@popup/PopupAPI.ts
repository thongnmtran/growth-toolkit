import { SimilarwebScraper } from '@/competitor-scrapers/similarweb/SimilarwebScraper';
import { LinkedInScraper } from '@/competitor-scrapers/linkedin/LinkedInScraper';
import { ProductHuntScraper } from '@/competitor-scrapers/product-hunt/ProductHuntScraper';
import { CapterraScraper } from '@/competitor-scrapers/capterra/CapterraScraper';
import { G2Scraper } from '@/competitor-scrapers/g2/G2Scraper';

export class PopupAPI {
  data: Record<string, string>[] = [];
  similarWebScraper!: SimilarwebScraper;
  linkedInScraper!: LinkedInScraper;
  productHuntScraper!: ProductHuntScraper;
  capterraScraper!: CapterraScraper;
  g2Scraper!: G2Scraper;

  constructor() {}

  async scrapeLinkedIn() {
    return this.linkedInScraper.scrape();
  }

  async searchLinkedIn(company: string) {
    return this.linkedInScraper.search(company);
  }

  async scrapeSimilarweb(domain: string, tabId?: number) {
    return this.similarWebScraper.scrape(domain, tabId);
  }

  async searchProductHunt(company: string) {
    return this.productHuntScraper.search(company);
  }

  async scrapeProductHunt() {
    return this.productHuntScraper.scrape();
  }

  async scrapeCapterra() {
    return this.capterraScraper.scrape();
  }

  async scrapeG2() {
    return this.g2Scraper.scrape();
  }
}
