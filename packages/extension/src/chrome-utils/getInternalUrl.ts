export function getInternalUrl(path: string): string {
  return `chrome-extension://${chrome.runtime.id}/${path}`;
}
