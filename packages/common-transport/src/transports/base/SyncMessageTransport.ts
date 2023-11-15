/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AnyMessageTransport,
  ExtractRequestType,
  ExtractResponseType,
  MessageListener,
  MessageTransport,
} from './MessageTransport';

// --- Models

export enum MatchableMessageType {
  REQUEST = 'request',
  RESPONSE = 'response',
}

export interface BaseMatchableMessage {
  id: string;
  type: MatchableMessageType;
}

export interface MatchableRequest<DataType> extends BaseMatchableMessage {
  type: MatchableMessageType.REQUEST;
  data: DataType;
}

export type MatchableRequestFromTransport<
  TransportType extends AnyMessageTransport,
> = MatchableRequest<ExtractRequestType<TransportType>>;

export interface MatchableResponse<DataType> extends BaseMatchableMessage {
  type: MatchableMessageType.RESPONSE;
  data?: DataType;
  error?: Error | null;
}

export type MatchableResponseFromTransport<
  TransportType extends AnyMessageTransport,
> = MatchableResponse<ExtractResponseType<TransportType>>;

export type MatchableMessage<RequestDataType = any, ResponseDataType = any> =
  | MatchableRequest<RequestDataType>
  | MatchableResponse<ResponseDataType>;

export type MatchableMessageFromTransport<
  TransportType extends AnyMessageTransport,
> = MatchableMessage<
  ExtractRequestType<TransportType>,
  ExtractResponseType<TransportType>
>;

// --- Type utils

export type ResponseTarget<RequestType> =
  | string
  | MatchableRequest<RequestType>;

export type ResponseTargetFromTransport<
  TransportType extends AnyMessageTransport,
> = ResponseTarget<ExtractRequestType<TransportType>>;

export type RequestListener<RequestType> = MessageListener<
  MatchableRequest<RequestType>
>;

export type RequestListenerFromTransport<
  TransportType extends AnyMessageTransport,
> = RequestListener<ExtractRequestType<TransportType>>;

export type ResponseListener<MessageType> = MessageListener<MessageType>;

export type ResponseListenerFromTransport<
  TransportType extends AnyMessageTransport,
> = ResponseListener<ExtractResponseType<TransportType>>;

export function getResponseTarget<RequestType>(
  target: ResponseTarget<RequestType>,
) {
  const requestId = typeof target === 'string' ? target : target.id;
  if (!requestId) {
    throw new Error('Request Id must be set');
  }
  return requestId;
}

/**
 * SyncMessageTransport
 */
export interface SyncMessageTransport<TransportType extends AnyMessageTransport>
  extends MessageTransport<
    MatchableMessageFromTransport<TransportType>,
    MatchableMessageFromTransport<TransportType>
  > {
  transport: TransportType;

  sendRequest<
    CustomRequestType extends ExtractRequestType<TransportType>,
    CustomResponseType extends ExtractResponseType<TransportType>,
  >(
    request: CustomRequestType,
  ): Promise<CustomResponseType>;

  sendResponse(
    target: ResponseTargetFromTransport<TransportType>,
    response?: ExtractResponseType<TransportType>,
    error?: Error,
  ): void;

  sendError(
    target: ResponseTargetFromTransport<TransportType>,
    error?: Error,
  ): void;

  sendVolativeRequest(request: ExtractRequestType<TransportType>): void;

  addRequestListener(
    listener: RequestListenerFromTransport<TransportType>,
  ): void;

  removeRequestListener(
    listener: RequestListenerFromTransport<TransportType>,
  ): void;

  addResponseListener(
    listener: ResponseListenerFromTransport<TransportType>,
  ): void;

  removeResponseListener(
    listener: ResponseListenerFromTransport<TransportType>,
  ): void;
}
