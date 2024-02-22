export async function resetCookies(domain: string) {
  const results = [];
  const cookies = await chrome.cookies.getAll({ domain });
  for (const cookie of cookies) {
    const result = await chrome.cookies.remove({
      url: `https://www.similarweb.com${cookie.path}`,
      name: cookie.name,
    });
    results.push(result);
  }
  return results;
}
