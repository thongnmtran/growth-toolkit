import { BaseTransport } from '@katalon-toolbox/common-transport';

export class ChromeRuntimeTransport<
  MessageType,
> extends BaseTransport<MessageType> {
  port?: chrome.runtime.Port;

  extensionId?: string;

  name?: string;

  constructor(extensionIdOrPort: string | chrome.runtime.Port, name?: string) {
    super();
    this.name = name;
    if (typeof extensionIdOrPort === 'string') {
      this.extensionId = extensionIdOrPort;
    }
    if (typeof extensionIdOrPort === 'object') {
      this.port = extensionIdOrPort;
    }
    this.handleMessage = this.handleMessage.bind(this);
  }

  override async connect() {
    if (!chrome.runtime) {
      throw new Error('Chrome.runtime is undefined in this context');
    }
    if (this.extensionId) {
      this.port = chrome.runtime.connect(this.extensionId, {
        name: this.name,
      });
    }
    if (!this.port) {
      throw new Error('Unable to establish a connection');
    }
    await super.connect();
  }

  protected override attachListeners(): void {
    this.port?.onMessage.addListener(this.handleMessage);
  }

  protected override detachListeners(): void {
    this.port?.onMessage.removeListener(this.handleMessage);
  }

  protected override handleMessage(message: MessageType): void {
    super.handleMessage(message);
  }

  override disconnect() {
    this.port?.disconnect();
    super.disconnect();
    this.port = undefined;
  }

  override sendMessage<MessageType>(message: MessageType) {
    if (!this.port) {
      throw new Error('Invalid connection!');
    }
    this.port.postMessage(message);
  }
}
