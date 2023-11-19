/* eslint-disable @typescript-eslint/no-explicit-any */
import { getError, uuid } from '@growth-toolkit/common-utils';
import { BaseTransport } from '../base/BaseTransport';
import {
  AnyMessageTransport,
  ExtractRequestType,
  ExtractResponseType,
} from '../base/MessageTransport';
import {
  MatchableMessageType,
  MatchableResponse,
  ResponseListener,
  SyncMessageTransport,
  getResponseTarget,
  MatchableMessageFromTransport,
  ResponseTargetFromTransport,
  RequestListenerFromTransport,
  ResponseListenerFromTransport,
} from '../base/SyncMessageTransport';
import { CommonTransportEvent } from '../../constants';

export const VOLATIVE_MESSAGE_ID = '';

export type ExtractSyncTransport<SyncTransportType extends SyncTransport<any>> =
  SyncTransportType extends SyncTransport<infer TransportType>
    ? TransportType
    : never;

export class SyncTransport<TransportType extends AnyMessageTransport>
  extends BaseTransport<
    MatchableMessageFromTransport<TransportType>,
    MatchableMessageFromTransport<TransportType>
  >
  implements SyncMessageTransport<TransportType>
{
  transport: TransportType;

  constructor(transport: TransportType) {
    super();
    this.transport = transport;
    this.handleMessage = this.handleMessage.bind(this);
  }

  override async connect() {
    await this.transport.connect();
    await super.connect();
  }

  protected override attachListeners(): void {
    this.transport.addMessageListener(this.handleMessage);
  }

  protected override detachListeners(): void {
    this.transport.removeMessageListener(this.handleMessage);
  }

  protected override handleMessage(
    message: MatchableMessageFromTransport<TransportType>,
  ): void {
    this.dispatchMessage(message);
    if (message.type === MatchableMessageType.REQUEST) {
      this.emitter.emit(CommonTransportEvent.REQUEST, message);
    } else if (message.type === MatchableMessageType.RESPONSE) {
      this.emitter.emit(CommonTransportEvent.RESPONSE, message.data);
    }
  }

  override disconnect() {
    this.transport.disconnect();
    super.disconnect();
  }

  override sendMessage(
    message: MatchableMessageFromTransport<TransportType>,
  ): void {
    this.sendRawMessage(message);
  }

  sendVolativeRequest(request: ExtractRequestType<TransportType>): void {
    this.sendRawMessage({
      type: MatchableMessageType.REQUEST,
      id: VOLATIVE_MESSAGE_ID,
      data: request,
    });
  }

  sendRawMessage(message: MatchableMessageFromTransport<TransportType>) {
    this.transport.sendMessage(message);
  }

  // --- Sync methods

  sendRequest<
    CustomRequestType extends
      ExtractRequestType<TransportType> = ExtractRequestType<TransportType>,
    CustomResponseType extends
      ExtractResponseType<TransportType> = ExtractResponseType<TransportType>,
  >(request: CustomRequestType): Promise<CustomResponseType> {
    return new Promise<CustomResponseType>((resolve, reject) => {
      const id = uuid();
      this.sendRawMessage({
        id,
        type: MatchableMessageType.REQUEST,
        data: request,
      });

      const waitForResponse: ResponseListener<
        MatchableResponse<ResponseType>
      > = async (response) => {
        if (response.id === id) {
          this.transport.removeMessageListener(waitForResponse);
          if (response.error) {
            reject(response.error);
            return;
          }
          resolve(response.data as never);
        }
      };
      this.transport.addMessageListener(waitForResponse);
    });
  }

  sendError(
    target: ResponseTargetFromTransport<TransportType>,
    error?: Error,
  ): void {
    this.sendResponse(target, undefined, error);
  }

  sendResponse(
    target: ResponseTargetFromTransport<TransportType>,
    response?: ExtractResponseType<TransportType>,
    error?: Error,
  ): void {
    const requestId = getResponseTarget(target);
    this.sendRawMessage({
      type: MatchableMessageType.RESPONSE,
      id: requestId,
      data: response,
      error: getError(error),
    });
  }

  // --- Additional listeners

  addRequestListener(
    listener: RequestListenerFromTransport<TransportType>,
  ): void {
    this.emitter.addListener(CommonTransportEvent.REQUEST, listener);
  }

  removeRequestListener(
    listener: RequestListenerFromTransport<TransportType>,
  ): void {
    this.emitter.removeListener(CommonTransportEvent.REQUEST, listener);
  }

  addResponseListener(
    listener: ResponseListenerFromTransport<TransportType>,
  ): void {
    this.emitter.addListener(CommonTransportEvent.RESPONSE, listener);
  }

  removeResponseListener(
    listener: ResponseListenerFromTransport<TransportType>,
  ): void {
    this.emitter.removeListener(CommonTransportEvent.RESPONSE, listener);
  }
}
