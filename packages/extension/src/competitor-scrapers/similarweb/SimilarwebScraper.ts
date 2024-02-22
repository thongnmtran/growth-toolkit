import { SimilarWebSiteInfo } from '@/competitor-scrapers/similarweb/types/SimilarwebSiteInfo';
import { SimilarwebScraperClient } from './SimilarwebScraperClient';
import { delay, waitForSuccess } from '@growth-toolkit/common-utils';
import { resetCookies } from '@/chrome-utils/resetCookies';

export class SimilarwebScraper {
  client?: SimilarwebScraperClient;

  async scrape(
    domain: string,
    tabIdz?: number,
  ): Promise<SimilarWebSiteInfo | undefined> {
    // const info = await this.client?.scrape(domain);
    // if (info) {
    //   return info;
    // }

    const targetUrl = `https://www.similarweb.com/website/${domain}/#overview`;

    let tabId = tabIdz!;
    if (!tabId) {
      const newTab = await chrome.tabs.create({ url: targetUrl });
      tabId = newTab.id!;
    }

    const getTab = async () => {
      return chrome.tabs.get(tabId!);
    };

    const tabUrl = (await getTab()).url;
    if (tabUrl !== targetUrl) {
      await chrome.tabs.update(tabId, { url: targetUrl });
    }

    const waitForInfo = async () => {
      this.client = undefined;
      const result = await waitForSuccess(
        async () => {
          const tab = await getTab();
          const client = this.client;
          if (tab.status != 'complete' || !client) {
            return;
          }
          const info = await client.scrape();
          if (info == null) {
            const isBlockedByCookies = await client.isBlockedByCookies();
            if (isBlockedByCookies) {
              await resetCookies('.similarweb.com');
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

    const info = await waitForInfo();

    return info;
  }
}
