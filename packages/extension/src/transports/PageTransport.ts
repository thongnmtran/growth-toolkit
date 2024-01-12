/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseTransport } from '@growth-toolkit/common-transport';
import { uuid } from '@growth-toolkit/common-utils';

export class PageTransport<MessageType> extends BaseTransport<MessageType> {
  id = uuid();

  constructor(public secretKey = 'growth-toolkit') {
    super();
    this.handleMessage = this.handleMessage.bind(this);
    this.middleMessageHandler = this.middleMessageHandler.bind(this);
  }

  async pureConnect() {
    if (this.connected) {
      return;
    }
    await super.connect();
  }

  override async connect() {
    if (this.connected) {
      return;
    }
    window.postMessage(
      { source: this.id, type: 'connect', key: this.secretKey },
      '*',
    );
    await super.connect();
  }

  protected override attachListeners(): void {
    window.addEventListener('message', this.middleMessageHandler);
  }

  protected override detachListeners(): void {
    window.removeEventListener('message', this.middleMessageHandler);
  }

  private middleMessageHandler(event: MessageEvent) {
    if (
      event.data?.source !== this.id &&
      event.data?.type === 'message' &&
      event.data?.key === this.secretKey
    ) {
      this.handleMessage(event.data.message);
    }
  }

  protected override handleMessage(message: MessageType): void {
    super.handleMessage(message);
  }

  override disconnect() {
    super.disconnect();
    this.connected = false;
  }

  override async sendMessage<MessageType>(message: MessageType) {
    window.postMessage(
      { source: this.id, type: 'message', key: this.secretKey, message },
      '*',
    );
  }
}
