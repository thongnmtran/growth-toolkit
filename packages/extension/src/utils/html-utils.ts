export function getInnerText(html?: HTMLElement | string) {
  if (typeof html === 'string') {
    const el = document.createElement('html');
    el.innerHTML = `<html><body>${html}</body></html>`;
    return el.innerText.trim();
  }
  return html?.innerText.trim() || '';
}
