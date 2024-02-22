/* eslint-disable @typescript-eslint/no-explicit-any */
import { gotoUrl } from '@/chrome-utils/gotoUrl';
import { PopupAPI } from '../PopupAPI';

export async function collectLinkedInInfo(params: {
  row: any;
  api: PopupAPI;
  tabId: number;
}) {
  const { api, row, tabId } = params;
  let linkedInUrl = row['LinkedIn'];
  if (!linkedInUrl) {
    const company = row['Company'];
    const curTab = await chrome.tabs.get(tabId);
    if (!curTab.url?.startsWith('https://www.linkedin.com/')) {
      await gotoUrl('https://www.linkedin.com/', tabId);
    }
    linkedInUrl = await api.searchLinkedIn(company);
  }

  if (!linkedInUrl) {
    return;
  }

  linkedInUrl = `${linkedInUrl}insights`;
  await gotoUrl(linkedInUrl, tabId);
  const info = await api.scrapeLinkedIn();
  info.linkedInUrl = linkedInUrl;

  return info;
}
