import { safeAsObject } from '@growth-toolkit/common-utils';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type FetchResponse = {
  status: number;
  statusText: string;
  text: string;
  json: any;
  headers: Record<string, string>;
  ok: boolean;
  type: ResponseType;
  bodyUsed: boolean;
  redirected: boolean;
  url: string;
};

export class Fetcher {
  async fetch(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<FetchResponse> {
    const res = await globalThis.fetch(input, init);

    const headers: FetchResponse['headers'] = {};
    for (const header of res.headers.entries()) {
      headers[header[0]] = header[1];
    }

    const text = await res.text();

    return {
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      headers,
      type: res.type,
      bodyUsed: res.bodyUsed,
      redirected: res.redirected,
      url: res.url,
      json: safeAsObject(text),
      text: text,
    };
  }
}
