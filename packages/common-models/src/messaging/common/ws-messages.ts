/* eslint-disable @typescript-eslint/no-explicit-any */
import { OutgoingHttpHeaders } from 'http';

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'HEAD' | 'DELETE' | 'OPTION';

export type WSReq<BodyType = any, QueryType = any> = {
  method: HTTPMethod;
  path: string;
  body?: BodyType;
  query?: QueryType;
};

export type WSRes<BodyType = any> = {
  status: number; // HTTP Status
  data?: BodyType;
  headers?: OutgoingHttpHeaders;
};
