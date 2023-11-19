/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChromeTransportServer } from '@/transports/ChromeTransportServer';
import { Fetcher } from '@/transports/Fetcher';
import { NewRemoteObjectHelper } from '@growth-toolkit/common-transport';

const transportServer = new ChromeTransportServer();

transportServer.addConnectionListener((connection) => {
  NewRemoteObjectHelper.attachToServer(new Fetcher(), connection, 'fetcher');
});

transportServer.listen();

console.log('Hello');
