/* eslint-disable @typescript-eslint/no-explicit-any */
import { delay } from '@growth-toolkit/common-utils';
import { get } from 'lodash';

export function exposeAPI(name: string, value: unknown) {
  (globalThis as any)[name] = value;
}

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

export function findElementByXPath<ElementType = HTMLElement>(
  selector: string,
  parent: ParentNode = document,
): ElementType | null {
  return document.evaluate(
    selector,
    parent,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null,
  ).singleNodeValue as never;
}

export function findElementByCSS<ElementType = HTMLElement>(
  selector: string,
  parent: ParentNode = document,
): ElementType | null {
  return parent.querySelector(selector) as never;
}

export function findElement<ElementType = HTMLElement>(
  selector: string,
  parent: ParentNode = document,
) {
  return selector.startsWith('//') || selector.startsWith('./')
    ? findElementByXPath<ElementType>(selector, parent)
    : findElementByCSS<ElementType>(selector, parent);
}
exposeAPI('findElement', findElement);

// ---

export function findElementsByXPath<ElementType = HTMLElement>(
  selector: string,
  parent: ParentNode = document,
): ElementType[] {
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

export function findElementsByCSS<ElementType = HTMLElement>(
  selector: string,
  parent: ParentNode = document,
): ElementType[] {
  return [...parent.querySelectorAll(selector)] as never;
}

export function findElements<ElementType = HTMLElement>(
  selector: string,
  parent: ParentNode = document,
) {
  return selector.startsWith('//')
    ? findElementsByXPath<ElementType>(selector, parent)
    : findElementsByCSS<ElementType>(selector, parent);
}

export type FindElementOption = {
  timeout?: number;
  hidden?: boolean;
  parent?: ParentNode;
};

export function waitForSelector<ElementType extends HTMLElement = HTMLElement>(
  selector: string,
  options?: FindElementOption,
) {
  return new Promise<ElementType | null>((resolve, reject) => {
    const timeout = options?.timeout ?? 30000;
    if (timeout === 0) {
      const element = findElement<ElementType>(selector, options?.parent);
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
      const element = findElement<ElementType>(selector, options?.parent);
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
      const element = findElement<ElementType>(selector, options?.parent);
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

    const element = findElement<ElementType>(selector, options?.parent);
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
exposeAPI('waitForSelector', waitForSelector);

export function isElementVisible(elem?: Node | null) {
  if (!elem) {
    return false;
  } else {
    return true;
  }

  // if (!(elem instanceof Element)) {
  //   throw Error('DomUtil: elem is not an element.');
  // }

  // const element = elem as HTMLElement;
  // const style = getComputedStyle(elem);
  // if (style.display === 'none') return false;
  // if (style.visibility !== 'visible') return false;
  // if (+style.opacity < 0.1) return false;
  // if (
  //   element.offsetWidth +
  //     element.offsetHeight +
  //     element.getBoundingClientRect().height +
  //     element.getBoundingClientRect().width ===
  //   0
  // ) {
  //   return false;
  // }
  // const elemCenter = {
  //   x: element.getBoundingClientRect().left + element.offsetWidth / 2,
  //   y: element.getBoundingClientRect().top + element.offsetHeight / 2,
  // };
  // if (elemCenter.x < 0) return false;
  // if (
  //   elemCenter.x > (document.documentElement.clientWidth || window.innerWidth)
  // )
  //   return false;
  // if (elemCenter.y < 0) return false;
  // if (
  //   elemCenter.y > (document.documentElement.clientHeight || window.innerHeight)
  // )
  //   return false;
  // let pointContainer = document.elementFromPoint(elemCenter.x, elemCenter.y);
  // do {
  //   if (pointContainer === element) return true;
  // } while ((pointContainer = pointContainer?.parentNode as never));
  // return false;
}
exposeAPI('isElementVisible', isElementVisible);

export function collectReactProps(
  selector: string,
  propPathInReactProps?: string | string[],
): any {
  const element = findElement(selector);
  if (!element) {
    return null;
  }
  const reactProps = findReactProps(element);
  if (!reactProps) {
    return null;
  }
  if (!propPathInReactProps) {
    return reactProps;
  }
  return get(reactProps, propPathInReactProps);
}
exposeAPI('collectReactProps', collectReactProps);

export function findReactProps(element: HTMLElement): any {
  for (const key in element) {
    if (key.startsWith('__reactProps$')) {
      return element[key as never];
    }
  }
  return null;
}
exposeAPI('findReactProps', findReactProps);

export async function scrollToBottom(element?: HTMLElement) {
  if (!element) {
    element = document.body;
  }
  element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
  await delay('.5s');
}

export function getElementAttr(
  selector: string,
  attribute: string,
  parent?: HTMLElement,
) {
  const element = findElement(selector, parent);
  return element?.getAttribute(attribute)?.trim() ?? '';
}
exposeAPI('getElementAttr', getElementAttr);

export function getElementText(selector: string, parent?: HTMLElement) {
  const element = findElement(selector, parent);
  return element?.innerText?.trim() ?? '';
}
exposeAPI('getElementText', getElementText);

export function setText(selector: string, text: string, parent?: HTMLElement) {
  const element = findElement(selector, parent) as HTMLInputElement;
  element.value = text;
  const reactProps = findReactProps(element);
  if (reactProps && reactProps.onChange) {
    const changeListener = (event: any) => {
      element.removeEventListener('change', changeListener);
      reactProps.onChange?.(event);
    };
    element.addEventListener('change', changeListener);
  }
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}
exposeAPI('setText', setText);
