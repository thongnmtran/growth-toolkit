/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseExecutionPipeline } from './BaseExecutionPipeline';
import { ExtractParamsType } from '../context';
import { AnyExecutionHandler, ExtractContextType } from '../handler';

export type ExecutionPipelineRunParams<
  HandlerType extends AnyExecutionHandler,
  RunOptionsType = never
> = {
  params: ExtractParamsType<ExtractContextType<HandlerType>>[];
  handlers: HandlerType[];
  options?: RunOptionsType;
};

export interface ExecutionPipeline<HandlerType extends AnyExecutionHandler>
  extends BaseExecutionPipeline<HandlerType> {
  /**
   * Produce a new sub-pipeline that is ready to run
   * @return {SubExecutionPipeline} a new sub-pipeline
   */
  schedule<AdditionalHandlers extends AnyExecutionHandler = never>(
    runParams?: ExecutionPipelineRunParams<HandlerType | AdditionalHandlers>
  ): unknown;

  run<AdditionalHandlers extends AnyExecutionHandler = never>(
    runParams?: ExecutionPipelineRunParams<HandlerType | AdditionalHandlers>
  ): Promise<ExtractContextType<HandlerType>>;
}

export type ExtractPipelineHandler<
  PipelineType extends ExecutionPipeline<any>
> = PipelineType extends ExecutionPipeline<infer HandlerType>
  ? HandlerType
  : never;
