/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExecutionHandler, ExtractHandlerParams } from '../../../base';

export async function runHandlers<HandlerType extends ExecutionHandler<any>>(
  handlers: HandlerType[],
  params: ExtractHandlerParams<HandlerType>
) {
  return Promise.all(handlers.map((handlerI) => runHandler(handlerI, params)));
}

export async function runHandler<HandlerType extends ExecutionHandler<any>>(
  handler: HandlerType,
  params: ExtractHandlerParams<HandlerType>
) {
  if (typeof handler === 'function') {
    await handler(params);
  } else {
    await handler.handle(params);
  }
}
