/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnyExecutionHandler } from "../handler/ExecutionHandler";

export interface BaseExecutionPipeline<
  HandlerType extends AnyExecutionHandler
> {
  handlers: HandlerType[];
  pushHandlers(...handlers: HandlerType[]): void;
}
