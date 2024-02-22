/* eslint-disable @typescript-eslint/no-explicit-any */
import { PopupAPI } from '../PopupAPI';

export async function collectSimilarwebInfo(params: {
  row: any;
  api: PopupAPI;
  tabId: number;
}) {
  const { api, row, tabId } = params;
  const domain = row['Domain'];
  if (!domain) {
    return;
  }
  const info = await api.scrapeSimilarweb(domain, tabId);
  return info;
}
