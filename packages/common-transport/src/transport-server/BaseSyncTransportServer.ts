import { AnyMessageTransport } from '../transports';
import { SyncMessageTransport } from '../transports/base/SyncMessageTransport';
import { BaseTransportServer } from './BaseTransportServer';

export abstract class BaseSyncTransportServer<
  TransportType extends AnyMessageTransport
> extends BaseTransportServer<SyncMessageTransport<TransportType>> {}
