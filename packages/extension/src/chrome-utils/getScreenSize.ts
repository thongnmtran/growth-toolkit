/* eslint-disable @typescript-eslint/no-explicit-any */

export async function getScreenSize() {
  const displays = await chrome.system.display.getInfo();
  const display =
    displays.find((display) => (display as any).activeState === 'active')! ||
    displays[0];
  return display.bounds;
}
