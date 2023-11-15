export function createAbortCtlFrom(...parents: AbortController[]) {
  const aborter = new AbortController();
  parents.forEach((parentI) => {
    if (parentI.signal.aborted) {
      aborter.abort();
    } else {
      parentI.signal.addEventListener('abort', () => {
        aborter.abort();
      });
    }
  });
  return aborter;
}

export function linkAborters(
  parent: AbortController,
  ...children: AbortController[]
) {
  parent.signal.addEventListener('abort', () => {
    children.forEach((aborterI) => {
      aborterI.abort();
    });
  });
}
