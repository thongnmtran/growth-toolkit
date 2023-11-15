/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseExecutionPipeline, ExecutionHandler } from "../../base";

type BasicHandler = ExecutionHandler<any>;

export abstract class BaseBasicExecutionPipeline<
  HandlerType extends ExecutionHandler<any>
> implements BaseExecutionPipeline<BasicHandler>
{
  constructor(public handlers: HandlerType[] = []) {}

  pushHandlers(...handlers: HandlerType[]) {
    this.handlers.push(...handlers);
  }
}
