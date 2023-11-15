export async function delay(secs: number) {
  return new Promise((resolve) => setTimeout(resolve, secs * 1000));
}

export async function delayForever(secs: number = -1) {
  await delay(secs === -1 ? 99999 : secs);
}
