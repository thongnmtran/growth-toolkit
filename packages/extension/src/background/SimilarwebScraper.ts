import { SimiarwebSiteInfo } from '@/competitor-scrapers/similarweb/types/SimilarwebSiteInfo';
import { Fetcher } from '@/transports/Fetcher';
import { fetchGoogleSheet } from '@/utils/fetchGoogleFile';

export class SimilarwebScraper {
  data: Record<string, SimiarwebSiteInfo> = {};

  client!: SimilarwebScraper;

  async run() {
    const res = await fetchGoogleSheet(
      'https://docs.google.com/spreadsheets/d/1wuDn1-dHaU9gwbGDIfDgoJCAVX-AAU1IXK8ovlP3kpU/edit#gid=707279259',
      new Fetcher(),
    );

    const products = res.rows.slice(7, 8);
    console.log('> products', products);

    for (const product of products) {
      const domain = product['Domain'];
      if (!domain) {
        continue;
      }
      const info = await this.client.collectClient();
      this.collect(info);
    }

    return this.data;
  }

  async collectClient(): Promise<SimiarwebSiteInfo> {
    console.log('> collectClient');
    return {} as never;
  }

  collect(info: SimiarwebSiteInfo) {
    console.log('> info', info);
    const domain = info?.companyInfo?.domain;
    if (!domain) {
      return;
    }
    this.data[domain] = info;
  }

  async resetCookies() {
    console.log('> resetCookies');
    const results = [];
    const cookies = await chrome.cookies.getAll({ domain: '.similarweb.com' });
    for (const cookie of cookies) {
      const result = await chrome.cookies.remove({
        url: `https://www.similarweb.com${cookie.path}`,
        name: cookie.name,
      });
      results.push(result);
    }
    return results;
  }
}
