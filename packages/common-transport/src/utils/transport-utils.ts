/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnyMessageTransport, SyncTransport } from '../transports';

export function isSyncTransport<TransportType extends AnyMessageTransport>(
  transport: AnyMessageTransport,
): transport is SyncTransport<TransportType> {
  return 'sendRequest' in transport;
}

export function asSyncTransport<TransportType extends AnyMessageTransport>(
  transport: TransportType,
) {
  return isSyncTransport<TransportType>(transport)
    ? transport
    : new SyncTransport<TransportType>(transport);
}
