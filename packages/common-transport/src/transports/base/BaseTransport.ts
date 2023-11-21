/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { EventEmitter } from 'events';
import { MessageListener, MessageTransport } from './MessageTransport';
import { CommonTransportEvent } from '../../constants';

export abstract class BaseTransport<RequestType = any, ResonseType = any>
  implements MessageTransport<RequestType, ResonseType>
{
  emitter: EventEmitter = new EventEmitter();

  protected connected = false;

  get isConnected(): boolean {
    return this.connected;
  }

  constructor() {
    this.handleMessage = this.handleMessage.bind(this);
    this.emitter.setMaxListeners(30);
  }

  async connect(..._args: unknown[]): Promise<void> {
    this.setupListeners();
    this.connected = true;
  }

  disconnect(..._args: unknown[]): void {
    this.detachListeners();
    this.connected = false;
  }

  sendMessage(_message: RequestType): void {
    throw new Error('Method not implemented.');
  }

  addMessageListener(listener: MessageListener<ResonseType>): void {
    this.emitter.addListener(CommonTransportEvent.MESSAGE, listener);
  }

  onceMessage(listener: MessageListener<ResonseType>): void {
    this.emitter.once(CommonTransportEvent.MESSAGE, listener);
  }

  removeMessageListener(listener: MessageListener<ResonseType>): void {
    this.emitter.removeListener(CommonTransportEvent.MESSAGE, listener);
  }

  protected setupListeners() {
    this.detachListeners();
    this.attachListeners();
  }

  protected attachListeners() {
    // Sub class can override this method
  }

  protected detachListeners() {
    // Sub class can override this method
  }

  protected handleMessage(message: ResonseType) {
    this.dispatchMessage(message);
  }

  protected dispatchMessage(message: ResonseType) {
    this.emitter.emit(CommonTransportEvent.MESSAGE, message);
  }
}
