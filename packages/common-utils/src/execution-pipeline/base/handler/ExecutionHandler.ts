/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AnyExecutionContext,
  ExecutionContext,
  ExtractParamsType,
  ExtractResultsType,
} from '../context';
import {
  BaseHandlerParams,
  ExecutionHandlerFunction,
} from './ExecutionHandlerFunction';
import { KeyedExecutionHandler } from './KeyedExecutionHandler';

export type ExecutionHandler<HandlerParamsType extends BaseHandlerParams<any>> =

    | ExecutionHandlerFunction<HandlerParamsType>
    | KeyedExecutionHandler<HandlerParamsType>;

export type AnyExecutionHandler = ExecutionHandler<any>;

export type ExtractContextType<HandlerType extends AnyExecutionHandler> =
  HandlerType extends ExecutionHandler<
    infer HandlerParamsType extends BaseHandlerParams<any>
  >
    ? HandlerParamsType extends BaseHandlerParams<
        infer ContextType extends AnyExecutionContext
      >
      ? ContextType
      : never
    : never;

export type ExtractParamsFromHandler<HandlerType extends AnyExecutionHandler> =
  ExtractParamsType<ExtractContextType<HandlerType>>;

export type ExtractResultsFromHandler<HandlerType extends AnyExecutionHandler> =
  ExtractResultsType<ExtractContextType<HandlerType>>;

export type ExtractHandlerParams<HandlerType extends AnyExecutionHandler> =
  HandlerType extends ExecutionHandlerFunction<
    infer HandlerParamsType extends BaseHandlerParams<any>
  >
    ? HandlerParamsType & Parameters<HandlerType>[0]
    : HandlerType extends KeyedExecutionHandler<
        infer HandlerParamsType extends BaseHandlerParams<any>
      >
    ? HandlerParamsType
    : never;

export type ExtendsHandlerContext<
  HandlerType extends AnyExecutionHandler,
  ContextType extends AnyExecutionContext
> = ExecutionContext<
  ExtractParamsFromHandler<HandlerType> | ExtractParamsType<ContextType>,
  ExtractResultsFromHandler<HandlerType> | ExtractResultsType<ContextType>
>;
