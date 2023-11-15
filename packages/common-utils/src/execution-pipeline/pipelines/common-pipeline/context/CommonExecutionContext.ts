/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ExecutionContext,
  ExecutionParam,
  ExecutionResult,
  ExtractResultsType,
} from '../../../base';
import {
  CommonExecutionResult,
  ExecutionMainResult,
} from './CommonExecutionResult';

export type CommonExecutionContext<
  ParamsType extends ExecutionParam = ExecutionParam,
  ResultsType extends ExecutionResult = ExecutionResult,
  MainResultType = never
> = ExecutionContext<
  ParamsType,
  ResultsType | CommonExecutionResult<MainResultType>
>;

export type AnyCommonExecutionContext = CommonExecutionContext<any, any, any>;

export type ExtractMainContextResult<
  ContextType extends CommonExecutionContext
> = Extract<ExtractResultsType<ContextType>, ExecutionMainResult<unknown>>;

export type ExtractMainResult<ContextType extends CommonExecutionContext> =
  ExtractMainContextResult<ContextType>['value'];
