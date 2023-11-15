/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BaseHandlerParams,
  ExecutionHandlerFunction,
} from "./ExecutionHandlerFunction";

export interface KeyedExecutionHandler<
  HandlerParamsType extends BaseHandlerParams<any>,
  KeyType extends string = string
> {
  key: KeyType;
  handle: ExecutionHandlerFunction<HandlerParamsType>;
}
