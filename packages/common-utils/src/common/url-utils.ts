import { filterNull } from './array-utils';

const location = globalThis.location || {
  protocol: 'http:',
  host: 'localhost',
};

export const ROOT_URL = new URL(`${location.protocol}//${location.host}`);

export function normalizePath(path?: string): string {
  if (!path) {
    return '/';
  }
  return path.startsWith('/') ? path : `/${path}`;
}

export function joinPaths(pathname: string, base?: string): string {
  if (!base) {
    return pathname;
  }
  const baseUrl = asURL(base);
  baseUrl.pathname = joinPathname(baseUrl.pathname, pathname);
  return baseUrl.pathname;
}

export function asURL(url: string | URL): URL {
  if (url instanceof URL) {
    return url;
  }
  try {
    return new URL(url);
  } catch {
    return new URL(url, ROOT_URL);
  }
}

export function joinPathname(basePathname: string, relativePathname: string) {
  return `${basePathname}/${relativePathname}`.replaceAll(/\/{2,}/g, '/');
}

export function mergeUrls(
  urls: (string | URL)[],
  options?: {
    mergeQuery?: boolean;
    mergeParams?: boolean;
  }
) {
  const { mergeQuery, mergeParams } = options || {};
  const validUrls = filterNull(urls);
  if (validUrls.length <= 0) {
    return '';
  }
  const url = asURL(validUrls[0] as never);
  validUrls.slice(1).forEach((urlI) => {
    if (mergeQuery) {
      const searchParamsI = asURL(urlI).searchParams;
      searchParamsI.forEach((value, key) => {
        url.searchParams.delete(key);
        url.searchParams.append(key, value);
      });
    }
    if (mergeParams) {
      //
    }
  });
  return url.toString();
}
