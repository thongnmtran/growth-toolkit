/* eslint-disable @typescript-eslint/no-explicit-any */
import { gotoUrl } from '@/chrome-utils/gotoUrl';
import { PopupAPI } from '../PopupAPI';

export async function collectG2Info(params: {
  row: any;
  api: PopupAPI;
  tabId: number;
}) {
  const { api, row, tabId } = params;

  const url = row['G2 URL'];
  if (!url) {
    return;
  }

  const curTab = await chrome.tabs.get(tabId);
  if (curTab.url != url) {
    await gotoUrl(url, tabId);
  }

  const info = await api.scrapeG2();
  return info;
}
