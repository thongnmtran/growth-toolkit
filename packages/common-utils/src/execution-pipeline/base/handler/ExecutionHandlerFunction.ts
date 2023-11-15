/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnyExecutionContext } from "../context";

export type BaseHandlerParams<ContextType extends AnyExecutionContext> = {
  context: ContextType;
};

export type ExecutionHandlerParams<
  HandlerParamsType extends BaseHandlerParams<any>
> = HandlerParamsType;

export interface ExecutionHandlerFunction<
  HandlerParamsType extends BaseHandlerParams<any>
> {
  (params: ExecutionHandlerParams<HandlerParamsType>): Promise<void> | void;
}
