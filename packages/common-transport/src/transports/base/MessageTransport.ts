/* eslint-disable @typescript-eslint/no-explicit-any */

export interface MessageListener<MessageType> {
  (
    message: MessageType,
    response: (response: MessageType, error?: Error) => void
  ): void;
}

export type ExtractRequestType<TransportType extends AnyMessageTransport> =
  TransportType extends MessageTransport<infer RequestType, any>
    ? RequestType
    : never;

export type ExtractResponseType<TransportType extends AnyMessageTransport> =
  TransportType extends MessageTransport<any, infer ResponseType>
    ? ResponseType
    : never;

export type ExtractMessageType<TransportType extends AnyMessageTransport> =
  | ExtractRequestType<TransportType>
  | ExtractResponseType<TransportType>;

export interface MessageTransport<RequestType, ResponseType> {
  connect(...args: unknown[]): Promise<void>;

  disconnect(...args: unknown[]): void;

  sendMessage(message: RequestType): void;

  addMessageListener(listener: MessageListener<ResponseType>): void;

  onceMessage(listener: MessageListener<ResponseType>): void;

  removeMessageListener(listener: MessageListener<ResponseType>): void;
}

export type AnyMessageTransport = MessageTransport<any, any>;
