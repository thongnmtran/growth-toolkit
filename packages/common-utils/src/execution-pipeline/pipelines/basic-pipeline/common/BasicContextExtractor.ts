import { Nullable } from '../../../../types';
import {
  AnyExecutionContext,
  ExtractParamsType,
  ExtractResultsType,
} from '../../../base';
import {
  findContextParam,
  findContextParams,
  findParam,
  getParam,
  getContextParam,
  findContextResult,
  findContextResults,
  findResult,
  getResult,
  getContextResult,
  pushParams,
  pushResults,
  removeParams,
  removeResults,
  setParams,
  setResults,
  findParams,
  insertParamsBefore,
  insertParamsAfter,
} from './BasicExecutionPipelineUtils';

export class BasicContextExtractor<ContextType extends AnyExecutionContext> {
  constructor(public context: ContextType) {}

  // --- Param Utils

  findContextParams<ParamType extends ExtractParamsType<ContextType>['type']>(
    type: ParamType
  ) {
    return findContextParams<ContextType, ParamType>(this.context, type);
  }

  findContextParam<ParamType extends ExtractParamsType<ContextType>['type']>(
    type: ParamType
  ) {
    return findContextParam<ContextType, ParamType>(this.context, type);
  }

  getContextParam<ParamType extends ExtractParamsType<ContextType>['type']>(
    type: ParamType,
    errorMessage?: string
  ) {
    return getContextParam<ContextType, ParamType>(
      this.context,
      type,
      errorMessage
    );
  }

  findParam<ParamType extends ExtractParamsType<ContextType>['type']>(
    type: ParamType
  ) {
    return findParam<ContextType, ParamType>(this.context, type);
  }

  findParams<ParamType extends ExtractParamsType<ContextType>['type']>(
    type: ParamType
  ) {
    return findParams<ContextType, ParamType>(this.context, type);
  }

  getParam<ParamType extends ExtractParamsType<ContextType>['type']>(
    type: ParamType,
    errorMessage?: string
  ) {
    return getParam<ContextType, ParamType>(this.context, type, errorMessage);
  }

  setParams(...newParams: ExtractParamsType<ContextType>[]): void {
    setParams(this.context, ...newParams);
  }

  removeParams(paramType: ExtractParamsType<ContextType>['type']): void {
    removeParams(this.context, paramType);
  }

  pushParams(...newParams: ExtractParamsType<ContextType>[]) {
    return pushParams(this.context, ...newParams);
  }

  insertParamsBefore(
    anchor: Nullable<ExtractParamsType<ContextType>['value']>,
    ...newParams: ExtractParamsType<ContextType>[]
  ) {
    return insertParamsBefore(this.context, anchor, ...newParams);
  }

  insertParamsAfter(
    anchor: Nullable<ExtractParamsType<ContextType>['value']>,
    ...newParams: ExtractParamsType<ContextType>[]
  ) {
    return insertParamsAfter(this.context, anchor, ...newParams);
  }

  // --- Result Utils

  findContextResults<
    ResultType extends ExtractResultsType<ContextType>['type']
  >(resultType: ResultType) {
    return findContextResults<ContextType, ResultType>(
      this.context,
      resultType
    );
  }

  findContextResult<ResultType extends ExtractResultsType<ContextType>['type']>(
    resultType: ResultType
  ) {
    return findContextResult<ContextType, ResultType>(this.context, resultType);
  }

  getContextResult<ResultType extends ExtractResultsType<ContextType>['type']>(
    resultType: ResultType,
    errorMessage?: string
  ) {
    return getContextResult<ContextType, ResultType>(
      this.context,
      resultType,
      errorMessage
    );
  }

  findResult<ResultType extends ExtractResultsType<ContextType>['type']>(
    resultType: ResultType
  ) {
    return findResult<ContextType, ResultType>(this.context, resultType);
  }

  getResult<ResultType extends ExtractResultsType<ContextType>['type']>(
    resultType: ResultType,
    errorMessage?: string
  ) {
    return getResult<ContextType, ResultType>(
      this.context,
      resultType,
      errorMessage
    );
  }

  setResults(...newResults: ExtractResultsType<ContextType>[]): void {
    setResults(this.context, ...newResults);
  }

  removeResults(resultType: ExtractResultsType<ContextType>['type']): void {
    removeResults(this.context, resultType);
  }

  pushResults(...newResults: ExtractResultsType<ContextType>[]) {
    return pushResults(this.context, ...newResults);
  }
}
