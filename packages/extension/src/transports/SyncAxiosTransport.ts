/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  MatchableMessageFromTransport,
  MessageListener,
  RequestListenerFromTransport,
  ResponseListenerFromTransport,
  ResponseTargetFromTransport,
  SyncMessageTransport,
} from '@growth-toolkit/common-transport';
import { AxiosRequest, AxiosResponse, AxiosTransport } from './AxiosTransport';

export class SyncAxiosTransport<
  RequestType extends AxiosRequest = AxiosRequest,
  ResponseType extends AxiosResponse = AxiosResponse,
> implements SyncMessageTransport<AxiosTransport<RequestType, ResponseType>>
{
  transport: AxiosTransport<RequestType, ResponseType> = {} as never;

  sendRequest<
    CustomRequestType extends RequestType,
    CustomResponseType extends ResponseType,
  >(_request: CustomRequestType): Promise<CustomResponseType> {
    throw new Error('Method not implemented.');
  }

  sendResponse(
    _target: ResponseTargetFromTransport<
      AxiosTransport<RequestType, ResponseType>
    >,
    _response?: ResponseType | undefined,
    _error?: Error | undefined,
  ): void {
    throw new Error('Method not implemented.');
  }

  sendError(
    _target: ResponseTargetFromTransport<
      AxiosTransport<RequestType, ResponseType>
    >,
    _error?: Error | undefined,
  ): void {
    throw new Error('Method not implemented.');
  }

  sendVolativeRequest(_request: RequestType): void {
    throw new Error('Method not implemented.');
  }

  addRequestListener(
    _listener: RequestListenerFromTransport<
      AxiosTransport<RequestType, ResponseType>
    >,
  ): void {
    throw new Error('Method not implemented.');
  }

  removeRequestListener(
    _listener: RequestListenerFromTransport<
      AxiosTransport<RequestType, ResponseType>
    >,
  ): void {
    throw new Error('Method not implemented.');
  }

  addResponseListener(
    _listener: ResponseListenerFromTransport<
      AxiosTransport<RequestType, ResponseType>
    >,
  ): void {
    throw new Error('Method not implemented.');
  }

  removeResponseListener(
    _listener: ResponseListenerFromTransport<
      AxiosTransport<RequestType, ResponseType>
    >,
  ): void {
    throw new Error('Method not implemented.');
  }

  connect(..._args: unknown[]): Promise<void> {
    throw new Error('Method not implemented.');
  }

  disconnect(..._args: unknown[]): void {
    throw new Error('Method not implemented.');
  }

  sendMessage(
    _message: MatchableMessageFromTransport<
      AxiosTransport<RequestType, ResponseType>
    >,
  ): void {
    throw new Error('Method not implemented.');
  }

  addMessageListener(
    _listener: MessageListener<
      MatchableMessageFromTransport<AxiosTransport<RequestType, ResponseType>>
    >,
  ): void {
    throw new Error('Method not implemented.');
  }

  onceMessage(
    _listener: MessageListener<
      MatchableMessageFromTransport<AxiosTransport<RequestType, ResponseType>>
    >,
  ): void {
    throw new Error('Method not implemented.');
  }

  removeMessageListener(
    _listener: MessageListener<
      MatchableMessageFromTransport<AxiosTransport<RequestType, ResponseType>>
    >,
  ): void {
    throw new Error('Method not implemented.');
  }
}
