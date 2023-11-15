/* eslint-disable @typescript-eslint/no-explicit-any */

import { AnyFunction, Nullable } from '../types';
import { filterNull } from './array-utils';
import { delay } from './promise-utils';
import { hasTimedOut } from './time';
import { AnyTimeInput } from './time/time-types';
export { type DebouncedFunc } from 'lodash';
import _throttle from 'lodash/throttle';
import _debounce from 'lodash/debounce';

export const debounce = _debounce;
export const throttle = _throttle;

export function call(object: any, method: string, params: unknown[]) {
  return object[method](...params);
}

export function createSafeCall<FuncType extends (...params: any[]) => any>(
  func: FuncType
) {
  return wrapFunc(safeCall, func);
}

export function safeCall<FuncType extends (...params: any[]) => any>(
  func: FuncType,
  ...params: Parameters<FuncType>
): ReturnType<FuncType> {
  return customCall(func, params, () => {});
}

export function createWarnCall<FuncType extends (...params: any[]) => any>(
  func: FuncType
) {
  return wrapFunc(warnCall, func);
}

export function warnCall<FuncType extends (...params: any[]) => any>(
  func: FuncType,
  ...params: Parameters<FuncType>
): ReturnType<FuncType> {
  return customCall(func, params, (error) => {
    console.warn(error);
  });
}

export function wrapFunc<FuncType extends (...params: any[]) => any>(
  wrapper: (
    func: FuncType,
    ...params: Parameters<FuncType>
  ) => ReturnType<FuncType>,
  func: FuncType
): FuncType {
  const topFunc = (...params: Parameters<FuncType>): ReturnType<FuncType> => {
    return wrapper(func, ...params);
  };
  return topFunc as never;
}

export function customCall<FuncType extends (...params: any[]) => any>(
  func: FuncType,
  params: Parameters<FuncType>,
  errorHandler: (error: any) => void
): ReturnType<FuncType> {
  try {
    const rs = func(...params);
    return rs instanceof Promise ? rs.catch(errorHandler) : rs;
  } catch (error) {
    errorHandler(error);
    return undefined as never;
  }
}

export function newToFunc<Type extends new (...params: any) => any>(
  constructable: Type
): (...params: ConstructorParameters<Type>) => InstanceType<Type> {
  return (...params: any) => {
    return new constructable(...params);
  };
}

export type Retryable = (options: RetryOptions) => any;

export type RetryOptions = {
  times?: number;
  timeout?: AnyTimeInput;
  delay?: AnyTimeInput;
};

export async function retry<RetryableType extends Retryable>(
  func: RetryableType,
  options?: RetryOptions
): Promise<ReturnType<RetryableType>> {
  const startTime = Date.now();
  let times = 0;
  let lastError;

  const noMoreTime = () => {
    return options?.timeout == null
      ? false
      : hasTimedOut(startTime, options.timeout);
  };
  const noMoreTry = () => {
    return options?.times == null ? false : options.times > times;
  };

  do {
    times++;
    try {
      return await func(options || {});
    } catch (error) {
      lastError = error;
    }
    if (!noMoreTime() && !noMoreTry()) {
      throw lastError;
    }
    await delay(options?.delay);
    // eslint-disable-next-line no-constant-condition
  } while (true);
}

export function forkCall<FuncType extends AnyFunction>(
  ...funcs: Nullable<FuncType>[]
) {
  return (...params: Parameters<FuncType>) => {
    filterNull(funcs).forEach((funcI) => funcI(...params));
  };
}
