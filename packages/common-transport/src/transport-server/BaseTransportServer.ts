import { EventEmitter } from 'events';
import { CommonTransportEvent } from '../constants';
import { ConnectionListener, TransportServer } from './TransportServer';
import { AnyMessageTransport } from '../transports';

export abstract class BaseTransportServer<
  ConnectionType extends AnyMessageTransport
> implements TransportServer<ConnectionType>
{
  emitter = new EventEmitter();

  abstract listen(): unknown;

  addConnectionListener(listener: ConnectionListener<ConnectionType>) {
    this.emitter.addListener(CommonTransportEvent.CONNECTION, listener);
  }

  removeConnectionListener(listener: ConnectionListener<ConnectionType>) {
    this.emitter.removeListener(CommonTransportEvent.CONNECTION, listener);
  }

  notifyConnection(connection: ConnectionType): void {
    this.emitter.emit(CommonTransportEvent.CONNECTION, connection);
  }
}
