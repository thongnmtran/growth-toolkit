import {
  BaseTransport,
  ExtractMessageType,
  ExtractRequestType,
  ExtractResponseType,
  AnyMessageTransport,
} from '../base';

export class SyncProxyTransport<
  TransportType extends AnyMessageTransport
> extends BaseTransport<
  ExtractRequestType<TransportType>,
  ExtractResponseType<TransportType>
> {
  private downstream: TransportType;

  private upstream: TransportType;

  constructor(downstream: TransportType, upstream: TransportType) {
    super();
    this.downstream = downstream;
    this.upstream = upstream;
    this.forwardToDownstream = this.forwardToDownstream.bind(this);
    this.forwardToUpstream = this.forwardToUpstream.bind(this);
  }

  override async attachListeners() {
    this.upstream.addMessageListener(this.forwardToDownstream);
    this.downstream.addMessageListener(this.forwardToUpstream);
  }

  protected override detachListeners(): void {
    this.upstream.removeMessageListener(this.forwardToDownstream);
    this.downstream.removeMessageListener(this.forwardToUpstream);
  }

  protected forwardToDownstream(message: ExtractMessageType<TransportType>) {
    this.forwardRequest(this.downstream, message);
  }

  protected forwardToUpstream(message: ExtractMessageType<TransportType>) {
    this.forwardRequest(this.upstream, message);
  }

  protected async forwardRequest(
    to: TransportType,
    message: ExtractMessageType<TransportType>
  ) {
    to.sendMessage(message);
  }
}
