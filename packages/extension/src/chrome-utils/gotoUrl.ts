function waitForTabLoad(tabId: number) {
  return new Promise<void>((resolve) => {
    const listener: Parameters<typeof chrome.tabs.onUpdated.addListener>[0] =
      function listener(tabIdz, info) {
        if (info.status === 'complete' && tabIdz === tabId) {
          chrome.tabs.onUpdated.removeListener(listener);
          resolve();
        }
      };
    chrome.tabs.onUpdated.addListener(listener);
  });
}

export async function gotoUrl(url: string, tabId: number) {
  await chrome.tabs.update(tabId, { url });
  await waitForTabLoad(tabId);
}
