/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ExecutionResult } from './ExecutionResult';
import type { ExecutionParam } from './ExecutionParam';
import type { AnyKey, Unpacked } from '../../../types';

export interface ExecutionContext<
  ParamsType extends ExecutionParam,
  ResultsType extends ExecutionResult
> {
  params: ParamsType[];
  results: ResultsType[];
}

export type AnyExecutionContext = ExecutionContext<any, any>;

export type RawExecutionContext = ExecutionContext<
  ExecutionParam,
  ExecutionResult
>;

// --- Utils

export type ExtractParamsType<ContextType extends AnyExecutionContext> =
  ContextType extends ExecutionContext<infer ParamsType, any>
    ? Unpacked<ParamsType>
    : never;

export type ExtractResultsType<ContextType extends AnyExecutionContext> =
  ContextType extends ExecutionContext<infer _ParamsType, infer ResultsType>
    ? Unpacked<ResultsType>
    : never;

export type ParamsFromParamMap<
  KeyType extends AnyKey,
  ParamMap extends { [Key in KeyType]: any } = { [Key in KeyType]: any }
> = {
  [Prop in keyof ParamMap]: ExecutionParam<Prop, ParamMap[Prop]>;
}[keyof ParamMap];

export type ResultsFromResultMap<
  KeyType extends AnyKey,
  ResultMap extends { [Key in KeyType]: any } = { [Key in KeyType]: any }
> = {
  [Prop in keyof ResultMap]: ExecutionResult<Prop, ResultMap[Prop]>;
}[keyof ResultMap];

export type ExtendsContext<
  BaseContext extends AnyExecutionContext,
  AdditionalContext extends AnyExecutionContext
> = ExecutionContext<
  | Unpacked<ExtractParamsType<BaseContext>>
  | Unpacked<ExtractParamsType<AdditionalContext>>,
  | Unpacked<ExtractResultsType<BaseContext>>
  | Unpacked<ExtractResultsType<AdditionalContext>>
>;

export type MergeContexts<Contexts extends AnyExecutionContext[]> =
  Contexts extends [
    infer FirstContext extends AnyExecutionContext,
    infer SecondContext extends AnyExecutionContext,
    ...infer RestContexts extends AnyExecutionContext[]
  ]
    ? MergeContexts<
        [ExtendsContext<FirstContext, SecondContext>, ...RestContexts]
      >
    : Contexts extends [
        infer FirstContext extends AnyExecutionContext,
        infer SecondContext extends AnyExecutionContext
      ]
    ? ExtendsContext<FirstContext, SecondContext>
    : Contexts extends [infer FirstContext]
    ? FirstContext
    : never;
