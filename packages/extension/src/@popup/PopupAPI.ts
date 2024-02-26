import { SimilarwebScraper } from '@/competitor-scrapers/similarweb/SimilarwebScraper';
import { LinkedInScraper } from '@/competitor-scrapers/linkedin/LinkedInScraper';
import { ProductHuntScraper } from '@/competitor-scrapers/product-hunt/ProductHuntScraper';
import { CapterraScraper } from '@/competitor-scrapers/capterra/CapterraScraper';
import { G2Scraper } from '@/competitor-scrapers/g2/G2Scraper';
import { waitFor } from '@growth-toolkit/common-utils';

export class PopupAPI {
  data: Record<string, string>[] = [];
  similarWebScraper!: SimilarwebScraper;
  linkedInScraper!: LinkedInScraper;
  productHuntScraper!: ProductHuntScraper;
  capterraScraper!: CapterraScraper;
  g2Scraper!: G2Scraper;

  constructor() {}

  #waitFor(key: keyof PopupAPI) {
    return waitFor(() => !!this[key], {
      timeout: 30000,
      interval: 100,
    });
  }

  async scrapeLinkedIn() {
    await this.#waitFor('linkedInScraper');
    return this.linkedInScraper.scrape();
  }

  async searchLinkedIn(company: string) {
    await this.#waitFor('linkedInScraper');
    const rs = await this.linkedInScraper.search(company);
    return rs;
  }

  async scrapeSimilarweb(domain: string, tabId?: number) {
    await this.#waitFor('similarWebScraper');
    return this.similarWebScraper.scrape(domain, tabId);
  }

  async searchProductHunt(company: string) {
    await this.#waitFor('productHuntScraper');
    return this.productHuntScraper.search(company);
  }

  async scrapeProductHunt() {
    await this.#waitFor('productHuntScraper');
    return this.productHuntScraper.scrape();
  }

  async scrapeCapterra() {
    await this.#waitFor('capterraScraper');
    return this.capterraScraper.scrape();
  }

  async scrapeG2() {
    await this.#waitFor('g2Scraper');
    return this.g2Scraper.scrape();
  }
}
