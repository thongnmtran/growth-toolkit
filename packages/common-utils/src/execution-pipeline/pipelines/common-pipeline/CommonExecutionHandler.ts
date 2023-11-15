/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BasicExecutionHandler,
  BasicExecutionHandlerParams,
} from '../basic-pipeline/BasicExecutionHandler';
import {
  CommonExecutionContext,
  ExtractMainResult,
} from './context/CommonExecutionContext';
import { CommonExecutionPipeline } from './CommonExecutionPipeline';
import { CommonSubExecutionPipeline } from './CommonSubExecutionPipeline';
import { CommonContextExtractor, ExecutionMainResult } from './index';
import {
  AnyExecutionHandler,
  ExecutionParam,
  ExecutionResult,
  ExtendsHandlerContext,
  ExtractParamsType,
  ExtractResultsType,
} from '../..';

export interface CommonExecutionHandlerParams<
  ContextType extends CommonExecutionContext = CommonExecutionContext,
  HandlerType extends CommonExecutionHandler = CommonExecutionHandler,
  PipelineType extends CommonExecutionPipeline<HandlerType> = CommonExecutionPipeline<HandlerType>,
  SubPipelineType extends CommonSubExecutionPipeline<
    HandlerType,
    PipelineType
  > = CommonSubExecutionPipeline<HandlerType, PipelineType>
> extends BasicExecutionHandlerParams<
    ContextType,
    HandlerType,
    PipelineType,
    SubPipelineType
  > {
  ctxe: CommonContextExtractor<ContextType>;
}

export type CommonExecutionHandler<
  HandlerParamsType extends CommonExecutionHandlerParams = CommonExecutionHandlerParams<
    CommonExecutionContext,
    any
  >
> = BasicExecutionHandler<HandlerParamsType>;

export type CommonExecutionHandlerFromContext<
  ContextType extends CommonExecutionContext
> = CommonExecutionHandler<CommonExecutionHandlerParams<ContextType>>;

export type CommonExecutionHandlerFromParamsAndResults<
  ParamsType extends ExecutionParam = ExecutionParam,
  ResultsType extends ExecutionResult = ExecutionResult,
  MainResultType = never
> = CommonExecutionHandler<
  CommonExecutionHandlerParams<
    CommonExecutionContext<ParamsType, ResultsType, MainResultType>
  >
>;

export type CommonExecutionHandlerFromMainResult<MainResultType = never> =
  CommonExecutionHandler<
    CommonExecutionHandlerParams<
      CommonExecutionContext<
        any,
        ExecutionMainResult<MainResultType>,
        MainResultType
      >
    >
  >;

export type ExtendsCommonExecutionHandler<
  HandlerType extends AnyExecutionHandler,
  ParamsType extends ExecutionParam = ExecutionParam,
  ResultsType extends ExecutionResult = ExecutionResult,
  MainResultType = never
> = CommonExecutionHandler<
  CommonExecutionHandlerParams<
    ExtendsHandlerContext<
      HandlerType,
      CommonExecutionContext<ParamsType, ResultsType, MainResultType>
    >
  >
>;

export type ExtendsCommonExecutionHandlerFromContext<
  HandlerType extends AnyExecutionHandler,
  ContextType extends CommonExecutionContext
> = ExtendsCommonExecutionHandler<
  HandlerType,
  ExtractParamsType<ContextType>,
  ExtractResultsType<ContextType>,
  ExtractMainResult<ContextType>
>;
