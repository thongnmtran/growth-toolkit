/* eslint-disable @typescript-eslint/no-explicit-any */

import { AnyFunction } from './primitive-types';

export type Func<ParamsType extends unknown[], ReturnType> = (
  ...params: ParamsType
) => ReturnType;

export type SingleParamFunc<ParamType, ReturnType> = (
  param: ParamType
) => ReturnType;

export type AwaitableFunc<ReturnType> = Func<
  unknown[],
  ReturnType | Promise<ReturnType>
>;

export type ValueProvider<ValueType> = Func<any[], ValueType>;

export type ValueProvidable<ValueType> = ValueType | ValueProvider<ValueType>;

export type ProviderValue<ValueProviderType> =
  ValueProviderType extends AnyFunction
    ? ReturnType<ValueProviderType>
    : ValueProviderType;
