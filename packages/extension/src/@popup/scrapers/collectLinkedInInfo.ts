/* eslint-disable @typescript-eslint/no-explicit-any */
import { gotoUrl } from '@/chrome-utils/gotoUrl';
import { PopupAPI } from '../PopupAPI';
import { LinkedInCompanyInfo } from '@/competitor-scrapers/linkedin/LinkedInCompanyInfo';

export async function collectLinkedInInfo(params: {
  row: any;
  api: PopupAPI;
  tabId: number;
}): Promise<LinkedInCompanyInfo | undefined> {
  const { api, row, tabId } = params;
  let linkedInUrl = row['LinkedIn'];
  if (!linkedInUrl) {
    const company = row['Company'] || row['Name'];
    if (company) {
      const curTab = await chrome.tabs.get(tabId);
      if (!curTab.url?.startsWith('https://www.linkedin.com/')) {
        await gotoUrl('https://www.linkedin.com/', tabId);
      }
      linkedInUrl = await api.searchLinkedIn(company);
    }
  }

  if (!linkedInUrl) {
    return {
      linkedInUrl: 'Not Found',
      name: row['Company'],
    } as LinkedInCompanyInfo;
  }
  let url = new URL(linkedInUrl);
  if (url.pathname.includes('/insightsinsights')) {
    url = new URL(url.toString().replace('/insightsinsights', '/insights'));
  }
  if (!url.pathname.includes('/insights')) {
    url = new URL('insights', linkedInUrl);
  }

  await gotoUrl(url.toString(), tabId);
  const info = await api.scrapeLinkedIn();
  info.linkedInUrl = url.toString();

  return info;
}
