/* eslint-disable @typescript-eslint/no-explicit-any */
export type Resolver<ValueType = unknown> = (value: ValueType) => void;

export type Rejector<ReasonType = any> = (reason?: ReasonType) => void;

export type PromiseExecutor<ValueType = unknown, ReasonType = any> = (
  resolve: (value: ValueType | PromiseLike<ValueType>) => void,
  reject: (reason?: ReasonType) => void
) => void;

export type AnyPromise = Promise<any>;

export type PromiseResult<PromiseType extends AnyPromise> =
  PromiseType extends Promise<infer ResultType> ? ResultType : never;

export type OnFullfilled<Type> = Parameters<Promise<Type>['then']>[0];
export type OnRejected<Type> = Parameters<Promise<Type>['then']>[0];
export type OnFinally<Type> = Parameters<Promise<Type>['finally']>[0];
