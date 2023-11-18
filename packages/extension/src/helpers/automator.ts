/* eslint-disable @typescript-eslint/no-explicit-any */
export function escapeXPathString(text: string) {
  if (!text) {
    return '';
  }
  if (text.indexOf("'") > -1) {
    text = text
      .split("'", -1)
      .map((substr) => {
        return "'" + substr + "'";
      })
      .join(',"\'",');
    return 'concat(' + text + ')';
  } else {
    return "'" + text + "'";
  }
}

export function findElementByXPath(
  selector: string,
  parent: ParentNode = document,
): HTMLElement | null {
  return document.evaluate(
    selector,
    parent,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null,
  ).singleNodeValue as never;
}

export function findElementByCSS(
  selector: string,
  parent: ParentNode = document,
): HTMLElement | null {
  return parent.querySelector(selector) as never;
}

export function findElement(selector: string, parent: ParentNode = document) {
  return selector.startsWith('//')
    ? findElementByXPath(selector, parent)
    : findElementByCSS(selector, parent);
}

// ---

export function findElementsByXPath(
  selector: string,
  parent: ParentNode = document,
): HTMLElement[] {
  const result = [];
  const nodesSnapshot = document.evaluate(
    selector,
    parent,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null,
  );
  for (let i = 0; i < nodesSnapshot.snapshotLength; i++) {
    result.push(nodesSnapshot.snapshotItem(i));
  }
  return result as never;
}

export function findElementsByCSS(
  selector: string,
  parent: ParentNode = document,
): HTMLElement[] {
  return [...parent.querySelectorAll(selector)] as never;
}

export function findElements(selector: string, parent: ParentNode = document) {
  return selector.startsWith('//')
    ? findElementsByXPath(selector, parent)
    : findElementsByCSS(selector, parent);
}

export type FindElementOption = {
  timeout?: number;
  hidden?: boolean;
};

export function waitForSelector(selector: string, options?: FindElementOption) {
  return new Promise<HTMLElement | null>((resolve, reject) => {
    const timeout = options?.timeout ?? 30000;
    if (timeout === 0) {
      const element = findElement(selector);
      if (!options?.hidden && isElementVisible(element)) {
        resolve(element);
        return;
      }
      if (options?.hidden && !isElementVisible(element)) {
        resolve(element);
        return;
      }
      if (options?.hidden) {
        reject(new Error(`Element not disappear: ${selector}`));
      } else {
        reject(new Error(`Element not found: ${selector}`));
      }
      return;
    }

    const observer = new MutationObserver(() => {
      // console.log('MutationObserver');
      const element = findElement(selector);
      if (!options?.hidden && isElementVisible(element)) {
        resolve(element);
        observer.disconnect();
        return;
      }
      if (options?.hidden && !isElementVisible(element)) {
        resolve(element);
        observer.disconnect();
        return;
      }
    });

    setTimeout(() => {
      observer.disconnect();
      const element = findElement(selector);
      if (!options?.hidden && isElementVisible(element)) {
        resolve(element);
        return;
      }
      if (options?.hidden && !isElementVisible(element)) {
        resolve(element);
        return;
      }
      if (options?.hidden) {
        reject(new Error(`Element not disappear: ${selector}`));
      } else {
        reject(new Error(`Element not found: ${selector}`));
      }
    }, timeout);

    const element = findElement(selector);
    if (!options?.hidden && isElementVisible(element)) {
      resolve(element);
      return;
    }
    if (options?.hidden && !isElementVisible(element)) {
      resolve(element);
      return;
    }

    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    });
  });
}

export function isElementVisible(elem?: Node | null) {
  if (!elem) {
    return false;
  } else {
    return true;
  }

  if (!(elem instanceof Element)) {
    throw Error('DomUtil: elem is not an element.');
  }

  const element = elem as HTMLElement;
  const style = getComputedStyle(elem);
  if (style.display === 'none') return false;
  if (style.visibility !== 'visible') return false;
  if (+style.opacity < 0.1) return false;
  if (
    element.offsetWidth +
      element.offsetHeight +
      element.getBoundingClientRect().height +
      element.getBoundingClientRect().width ===
    0
  ) {
    return false;
  }
  const elemCenter = {
    x: element.getBoundingClientRect().left + element.offsetWidth / 2,
    y: element.getBoundingClientRect().top + element.offsetHeight / 2,
  };
  if (elemCenter.x < 0) return false;
  if (
    elemCenter.x > (document.documentElement.clientWidth || window.innerWidth)
  )
    return false;
  if (elemCenter.y < 0) return false;
  if (
    elemCenter.y > (document.documentElement.clientHeight || window.innerHeight)
  )
    return false;
  let pointContainer = document.elementFromPoint(elemCenter.x, elemCenter.y);
  do {
    if (pointContainer === element) return true;
  } while ((pointContainer = pointContainer?.parentNode as never));
  return false;
}

export function findReactProps(element: HTMLElement): any {
  for (const key in element) {
    if (key.startsWith('__reactProps$')) {
      return element[key as never];
    }
  }
  return null;
}
