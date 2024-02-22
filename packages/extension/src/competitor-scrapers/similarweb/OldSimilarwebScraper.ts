import { SimilarWebSiteInfo } from '@/competitor-scrapers/similarweb/types/SimilarwebSiteInfo';
import { Fetcher } from '@/transports/Fetcher';
import { fetchGoogleSheet } from '@/utils/fetchGoogleFile';
import { delay, waitForSuccess } from '@growth-toolkit/common-utils';

export class OldSimilarwebScraper {
  data: Record<string, SimilarWebSiteInfo> = {};

  client?: OldSimilarwebScraper;

  async run() {
    const [tab] = (await chrome.tabs.query({
      active: true,
      currentWindow: true,
    }))!;
    console.log('> Tab', tab);
    const tabId = tab?.id;
    if (!tabId) {
      return;
    }

    // Katalon Competitors
    const competitorSheetURL1 =
      'https://docs.google.com/spreadsheets/d/1wuDn1-dHaU9gwbGDIfDgoJCAVX-AAU1IXK8ovlP3kpU/edit#gid=707279259';

    // Watch
    const competitorSheetURL2 =
      'https://docs.google.com/spreadsheets/d/1wuDn1-dHaU9gwbGDIfDgoJCAVX-AAU1IXK8ovlP3kpU/edit#gid=1383957454';

    const competitorSheetURL = competitorSheetURL1 || competitorSheetURL2;

    const res = await fetchGoogleSheet(competitorSheetURL, new Fetcher());

    const products = res.rows.slice(0);
    console.log('> products', products);

    const getTab = async () => {
      return chrome.tabs.get(tabId);
    };

    const waitForInfo = async () => {
      this.client = undefined;
      const result = await waitForSuccess(
        async () => {
          const tab = await getTab();
          const client = this.client;
          if (tab.status != 'complete' || !client) {
            return;
          }
          const info = await client.collectClient();
          console.log('> Cur Info:', info);
          if (info == null) {
            const isBlockedByCookies = await client.isBlockedByCookies();
            if (isBlockedByCookies) {
              await this.resetCookies();
              await delay('1s');
              await chrome.tabs.reload(tabId);
              await delay('20s');
            } else {
              const isNotFound = await client.isNotFound();
              if (isNotFound) {
                console.log('> Not found');
                return {} as never;
              }
            }
          }
          return info;
        },
        { notNull: true, delay: 1000 },
      );
      await delay('10s');
      return result;
    };

    for (const product of products) {
      const domain = product['Domain'];
      if (!domain) {
        continue;
      }

      console.log('> Domain:', domain);

      // Load from data
      const collectedInfo = this.data[domain];
      if (collectedInfo) {
        console.log('> Already collected:', collectedInfo);
        await this.client?.collect(collectedInfo);
        continue;
      }

      // Load from local storage
      const cachedInfo = await this.client?.collectClient(domain);
      if (cachedInfo) {
        console.log('> Cached info:', collectedInfo);
        this.collect(cachedInfo);
        continue;
      }

      // Navigate to info page
      const targetUrl = `https://www.similarweb.com/website/${domain}/#overview`;
      const tabUrl = (await getTab()).url;
      if (tabUrl !== targetUrl) {
        await chrome.tabs.update(tabId, { url: targetUrl });
      }

      // Collect new info & Handle blockers
      console.log('> Collecting:', domain);
      const info = await waitForInfo();
      console.log('> Info:', info);
      if (info.domain) {
        this.collect(info);
      } else {
        this.collect({ domain } as never);
        await this.client?.collect({ domain } as never);
      }
    }

    console.log('> Done', this.data);
    if (await this.client?.isBlockedByCookies()) {
      await this.resetCookies();
      await delay('1s');
      await chrome.tabs.reload(tabId);
    }

    return this.data;
  }

  async collectClient(
    domain?: string,
  ): Promise<SimilarWebSiteInfo | undefined> {
    console.log('> Collect:', domain);
    return {} as never;
  }

  collect(info: SimilarWebSiteInfo) {
    console.log('> info', info);
    const domain = info?.domain;
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

  async isBlockedByCookies() {
    return false;
  }

  async isNotFound() {
    return false;
  }
}
