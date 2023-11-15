/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  findValue,
  findValues,
  findValueWithCheck,
  pushValues,
  removeValues,
  replaceValues,
  ExtractValueType,
  insertValuesBefore,
  insertValuesAfter,
} from '../../../../typed';
import { Nullable } from '../../../../types';
import {
  AnyExecutionContext,
  ExtractParamsType,
  ExtractResultsType,
} from '../../../base';

// --- Utils for Params

export function findContextParams<
  ContextType extends AnyExecutionContext,
  ParamType extends ExtractParamsType<ContextType>['type']
>(context: ContextType, paramType: ParamType) {
  return findValues<ExtractParamsType<ContextType>, ParamType>(
    context.params,
    paramType
  );
}

export function findContextParam<
  ContextType extends AnyExecutionContext,
  ParamType extends ExtractParamsType<ContextType>['type']
>(context: ContextType, paramType: ParamType) {
  return findValue<ExtractParamsType<ContextType>, ParamType>(
    context.params,
    paramType
  );
}

export function getContextParam<
  ContextType extends AnyExecutionContext,
  ParamType extends ExtractParamsType<ContextType>['type']
>(context: ContextType, paramType: ParamType, errorMessage?: string) {
  return findValueWithCheck<ExtractParamsType<ContextType>, ParamType>(
    context.params,
    paramType,
    errorMessage
  );
}

export function findParam<
  ContextType extends AnyExecutionContext,
  ParamType extends ExtractParamsType<ContextType>['type']
>(
  context: ContextType,
  paramType: ParamType
): ExtractValueType<ExtractParamsType<ContextType>, ParamType> | undefined {
  return findValue<ExtractParamsType<ContextType>, ParamType>(
    context.params,
    paramType
  )?.value;
}

export function findParams<
  ContextType extends AnyExecutionContext,
  ParamType extends ExtractParamsType<ContextType>['type']
>(
  context: ContextType,
  paramType: ParamType
): ExtractValueType<ExtractParamsType<ContextType>, ParamType>[] {
  return findValues<ExtractParamsType<ContextType>, ParamType>(
    context.params,
    paramType
  ).map((paramI) => paramI.value);
}

export function getParam<
  ContextType extends AnyExecutionContext,
  ParamType extends ExtractParamsType<ContextType>['type']
>(
  context: ContextType,
  paramType: ParamType,
  errorMessage?: string
): ExtractValueType<ExtractParamsType<ContextType>, ParamType> {
  return findValueWithCheck<ExtractParamsType<ContextType>, ParamType>(
    context.params,
    paramType,
    errorMessage
  ).value;
}

export function setParams<ContextType extends AnyExecutionContext>(
  context: ContextType,
  ...newParams: ExtractParamsType<ContextType>[]
): void {
  replaceValues(context.params, ...newParams);
}

export function removeParams<
  ContextType extends AnyExecutionContext,
  ParamType extends ExtractParamsType<ContextType>['type']
>(context: ContextType, paramType: ParamType): void {
  removeValues(context.params, paramType);
}

export function pushParams<ContextType extends AnyExecutionContext>(
  context: ContextType,
  ...newParams: ExtractParamsType<ContextType>[]
) {
  return pushValues(context.params, ...newParams);
}

export function insertParamsBefore<ContextType extends AnyExecutionContext>(
  context: ContextType,
  anchor: Nullable<ExtractParamsType<ContextType>['value']>,
  ...newParams: ExtractParamsType<ContextType>[]
) {
  const anchorParam = context.params.find(
    (paramI: any) => paramI.value === anchor
  );
  return insertValuesBefore(context.params, anchorParam, ...newParams);
}

export function insertParamsAfter<ContextType extends AnyExecutionContext>(
  context: ContextType,
  anchor: Nullable<ExtractParamsType<ContextType>['value']>,
  ...newParams: ExtractParamsType<ContextType>[]
) {
  const anchorParam = context.params.findLast(
    (paramI: any) => paramI.value === anchor
  );
  return insertValuesAfter(context.params, anchorParam, ...newParams);
}

// --- Utils for Results

export function findContextResults<
  ContextType extends AnyExecutionContext,
  ResultType extends ExtractResultsType<ContextType>['type']
>(context: ContextType, resultType: ResultType) {
  return findValues<ExtractResultsType<ContextType>, ResultType>(
    context.results,
    resultType
  );
}

export function findContextResult<
  ContextType extends AnyExecutionContext,
  ResultType extends ExtractResultsType<ContextType>['type']
>(context: ContextType, resultType: ResultType) {
  return findValue<ExtractResultsType<ContextType>, ResultType>(
    context.results,
    resultType
  );
}

export function getContextResult<
  ContextType extends AnyExecutionContext,
  ResultType extends ExtractResultsType<ContextType>['type']
>(context: ContextType, resultType: ResultType, errorMessage?: string) {
  return findValueWithCheck<ExtractResultsType<ContextType>, ResultType>(
    context.results,
    resultType,
    errorMessage
  );
}

export function findResult<
  ContextType extends AnyExecutionContext,
  ResultType extends ExtractResultsType<ContextType>['type']
>(
  context: ContextType,
  resultType: ResultType
): ExtractValueType<ExtractResultsType<ContextType>, ResultType> | undefined {
  return findValue<ExtractResultsType<ContextType>, ResultType>(
    context.results,
    resultType
  )?.value;
}

export function getResult<
  ContextType extends AnyExecutionContext,
  ResultType extends ExtractResultsType<ContextType>['type']
>(
  context: ContextType,
  paramType: ResultType,
  errorMessage?: string
): ExtractValueType<ExtractResultsType<ContextType>, ResultType> {
  return findValueWithCheck<ExtractResultsType<ContextType>, ResultType>(
    context.results,
    paramType,
    errorMessage
  ).value;
}

export function setResults<ContextType extends AnyExecutionContext>(
  context: ContextType,
  ...newResults: ExtractResultsType<ContextType>[]
): void {
  replaceValues(context.results, ...newResults);
}

export function removeResults<
  ContextType extends AnyExecutionContext,
  ResultType extends ExtractResultsType<ContextType>['type']
>(context: ContextType, resultType: ResultType): void {
  removeValues(context.results, resultType);
}

export function pushResults<ContextType extends AnyExecutionContext>(
  context: ContextType,
  ...newResults: ExtractResultsType<ContextType>[]
) {
  return pushValues(context.results, ...newResults);
}
