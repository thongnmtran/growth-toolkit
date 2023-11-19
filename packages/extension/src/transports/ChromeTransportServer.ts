/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BaseSyncTransportServer,
  asSyncTransport,
} from '@growth-toolkit/common-transport';
import { ChromeRuntimeTransport } from './ChromeRuntimeTransport';

export class ChromeTransportServer extends BaseSyncTransportServer<
  ChromeRuntimeTransport<any>
> {
  override listen(): void {
    chrome.runtime.onConnect.addListener((port: any) => {
      console.log('> New connection:', port);
      const transport = asSyncTransport(new ChromeRuntimeTransport(port));
      this.notifyConnection(transport);
    });

    chrome.runtime.onConnectExternal.addListener((port: any) => {
      console.log('> New external connection', port);
      const transport = asSyncTransport(new ChromeRuntimeTransport(port));
      this.notifyConnection(transport);
    });
  }
}
