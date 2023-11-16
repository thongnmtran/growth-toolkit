import { BaseTransport } from '@katalon-toolbox/common-transport';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export type AxiosRequest<BodyType = unknown> = AxiosRequestConfig<BodyType>;

export type { AxiosResponse } from 'axios';

export class AxiosTransport<
  RequestType extends AxiosRequest = AxiosRequest,
  ResponseType extends AxiosResponse = AxiosResponse,
> extends BaseTransport<RequestType, ResponseType> {
  constructor(public serverUrl?: string) {
    super();
  }

  override sendMessage(message: RequestType): void {
    axios
      .request({
        ...message,
        url: this.serverUrl,
      })
      .then((res) => {
        this.handleMessage(res.data);
      })
      .catch((err) => {
        this.handleMessage(err);
      });
  }
}
