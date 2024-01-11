import { ChromeRuntimeTransport } from '@/transports/ChromeRuntimeTransport';
import { Fetcher } from '@/transports/Fetcher';
import {
  NewRemoteObjectHelper,
  asSyncTransport,
} from '@growth-toolkit/common-transport';

export const transport = asSyncTransport(
  new ChromeRuntimeTransport(chrome?.runtime?.id),
);

transport.connect();

export const fetcher = NewRemoteObjectHelper.wrapClient(
  {} as Fetcher,
  transport,
  'fetcher',
);
