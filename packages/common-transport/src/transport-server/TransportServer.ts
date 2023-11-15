import { AnyMessageTransport } from '../index';

export type ConnectionListener<ConnectionType extends AnyMessageTransport> = (
  connection: ConnectionType
) => void;

export interface TransportServer<ConnectionType extends AnyMessageTransport> {
  listen(): unknown;

  addConnectionListener(listener: ConnectionListener<ConnectionType>): void;

  removeConnectionListener(listener: ConnectionListener<ConnectionType>): void;

  notifyConnection(connection: ConnectionType): void;
}
