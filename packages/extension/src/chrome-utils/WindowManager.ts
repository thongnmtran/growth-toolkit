import { getScreenSize } from '@/chrome-utils/getScreenSize';

export class WindowManager {
  windowIds: number[] = [];
  tabIds: number[] = [];
  counter = 0;

  async newTab(url = 'about:blank') {
    const windows: number[] = [];

    const { width, height } = await getScreenSize();
    const numTabs = this.counter;
    this.counter++;
    const newWindow = await chrome.windows.create({
      state: 'normal',
      type: 'popup',
      top: numTabs * 10 + 200,
      left: numTabs * 10,
      width: width - 400 - numTabs * 10,
      height: height - 200 - numTabs * 10,
    });
    windows.push(newWindow.id!);
    const newTab = await chrome.tabs.create({ url, windowId: newWindow.id });
    this.tabIds.push(newTab.id!);
    return newTab;
  }

  async closeAll() {
    for (const tabId of this.tabIds) {
      await chrome.tabs.remove(tabId).catch(() => {});
    }
    for (const windowId of this.windowIds) {
      await chrome.windows.remove(windowId).catch(() => {});
    }
  }
}
