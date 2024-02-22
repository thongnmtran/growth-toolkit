/* eslint-disable @typescript-eslint/no-explicit-any */

import { getInternalUrl } from '@/chrome-utils/getInternalUrl';
import { getScreenSize } from '@/chrome-utils/getScreenSize';

let popupWindowId: number | undefined;

export function initPopup() {
  chrome.action.onClicked.addListener(async () => {
    if (popupWindowId) {
      const popupWindow = await chrome.windows
        .get(popupWindowId)
        .catch(() => null);
      if (popupWindow) {
        await chrome.windows.update(popupWindowId, { focused: true });
        return;
      } else {
        popupWindowId = undefined;
      }
    }

    const { width, height } = await getScreenSize();
    const panelWidth = 400;
    const panelHeight = 600;

    const newWindow = await chrome.windows.create({
      left: width - panelWidth,
      top: height - panelHeight,
      height: panelHeight,
      width: panelWidth,
      type: 'popup',
    });
    popupWindowId = newWindow.id;
    await chrome.tabs.create({
      url: getInternalUrl('src/@popup/popup.html'),
      windowId: newWindow.id,
      pinned: true,
    });
  });
}
