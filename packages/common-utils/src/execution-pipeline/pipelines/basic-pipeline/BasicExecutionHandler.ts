/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AnyExecutionContext,
  BaseHandlerParams,
  ExecutionHandler,
} from '../../base/index';
import { BasicExecutionPipeline } from './BasicExecutionPipeline';
import { BasicSubExecutionPipeline } from './BasicSubExecutionPipeline';
import { BasicContextExtractor } from './index';

export interface BasicExecutionHandlerParams<
  ContextType extends AnyExecutionContext,
  HandlerType extends BasicExecutionHandler<any>,
  PipelineType extends BasicExecutionPipeline<HandlerType>,
  SubPipelineType extends BasicSubExecutionPipeline<HandlerType, PipelineType>
> extends BaseHandlerParams<ContextType> {
  prevContext: ContextType;
  pipeLine: PipelineType;
  subPipeline: SubPipelineType;
  ctxe: BasicContextExtractor<ContextType>;
}

export type BasicExecutionHandler<
  HandlerParamsType extends BasicExecutionHandlerParams<any, any, any, any>
> = ExecutionHandler<HandlerParamsType>;
