/* eslint-disable @typescript-eslint/no-explicit-any */
import { gotoUrl } from '@/chrome-utils/gotoUrl';
import { PopupAPI } from '../PopupAPI';

export async function collectProductHuntInfo(params: {
  row: any;
  api: PopupAPI;
  tabId: number;
}) {
  const { api, row, tabId } = params;

  let url = row['ProductHunt URL'];
  if (!url) {
    const curTab1 = await chrome.tabs.get(tabId);
    if (!curTab1.url?.startsWith('https://www.producthunt.com/')) {
      await gotoUrl('https://www.producthunt.com/', tabId);
    }
    url = await api.searchProductHunt(row['Name']);
    if (!url) {
      url = await api.searchProductHunt(row['Company']);
    }
  }
  if (!url) {
    return;
  }

  const curTab = await chrome.tabs.get(tabId);
  if (curTab.url != url) {
    await gotoUrl(url, tabId);
  }

  const info = await api.scrapeProductHunt();
  if (info) {
    info.reviewsUrl = url;
  }
  return info;
}
