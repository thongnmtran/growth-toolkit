import { Awaitable } from '../../../types';
import { AnyExecutionHandler, ExtractHandlerParams } from './ExecutionHandler';

export type WrappedExecutionHandler<
  HandlerType extends AnyExecutionHandler,
  AdditionalParams extends unknown[] = never[]
> = (
  params: ExtractHandlerParams<HandlerType>,
  ...additionalParams: AdditionalParams
) => Awaitable<void>;

export type ExecutionHandlerWrapper<
  HandlerType extends AnyExecutionHandler,
  AdditionalParams extends unknown[] = never[]
> = (
  ...handlers: WrappedExecutionHandler<HandlerType, AdditionalParams>[]
) => HandlerType;
