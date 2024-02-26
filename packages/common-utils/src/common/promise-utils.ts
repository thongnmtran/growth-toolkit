/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AnyFunction,
  AnyPromise,
  Awaitable,
  Nullable,
  PromiseExecutor,
  PromiseResult,
  Rejector,
  Resolver,
} from '../types';
import { AnyDurationInput } from './time/time-types';
import { parseAnyTime } from './time/time-utils';

export type AwaitedReturn<FuncType extends AnyFunction> = Awaited<
  ReturnType<FuncType>
>;

export type PromiseReturn<FuncType extends AnyFunction> = Promise<
  AwaitedReturn<FuncType>
>;

export type NullablePromiseReturn<FuncType extends AnyFunction> = Promise<
  AwaitedReturn<FuncType> | undefined
>;

export type PromiseReturnMany<FuncType extends AnyFunction> = Promise<
  AwaitedReturn<FuncType>[]
>;

export type PromiseController<ReturnType> = {
  resolve: Resolver<ReturnType>;
  reject: Rejector;
  promise: Promise<ReturnType>;
};

export function newPromise<ReturnType = void>() {
  const newPromise = {} as PromiseController<ReturnType>;

  const promise = new Promise<ReturnType>((resolve, reject) => {
    newPromise.resolve = resolve;
    newPromise.reject = reject;
  });

  newPromise.promise = promise;

  return newPromise;
}

export function delay(timeout: AnyDurationInput = 0) {
  return new Promise((resolve) => setTimeout(resolve, parseAnyTime(timeout)));
}

export function delayForever(timeout = 999999999) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

export function safePromise<ValueType = unknown, ReasonType = any>(
  executor: PromiseExecutor<ValueType, ReasonType>,
) {
  return new Promise((resolve, reject) => {
    try {
      const result = executor(resolve, reject);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

export function safe<PromiseType>(
  promise: PromiseType,
  logger: Nullable<AnyFunction> = null,
): PromiseType extends AnyPromise ? PromiseResult<PromiseType> : PromiseType {
  if (promise instanceof Promise) {
    return promise.catch((error) => {
      logger?.(error);
    }) as never;
  }
  return promise as never;
}

export async function asPromise<ValueType>(value: ValueType) {
  return value;
}

export async function asVoidPromise(value: unknown) {
  await value;
}

export class PromiseManager {
  promises: Promise<void>[] = [];
  constructor(
    public parallel?: boolean,
    public allSettled?: boolean,
  ) {}

  async register(promise: unknown) {
    if (!this.parallel) {
      await promise;
    } else {
      this.promises.push(asVoidPromise(promise));
    }
  }

  async awaitAll() {
    if (this.allSettled) {
      await Promise.allSettled(this.promises);
    } else {
      await Promise.all(this.promises);
    }
  }
}

export async function forEachBatch<ItemType>({
  array,
  batch = 5,
  parallel,
  allSettled,
  delay: delayAmount,
  func,
}: {
  array: ItemType[];
  batch?: number;
  parallel?: boolean;
  allSettled?: boolean;
  delay?: number;
  func: (batch: ItemType[]) => Promise<void> | void;
}): Promise<void> {
  let rest = array;
  const promiseCtl = new PromiseManager(parallel, allSettled);

  while (rest.length > 0) {
    const curBatch = rest.slice(0, batch);
    rest = rest.slice(5);
    const promise = func(curBatch);
    await promiseCtl.register(promise);
    await delay(delayAmount);
  }

  await promiseCtl.awaitAll();
}

export function awaitAll<HandlerType extends AnyFunction>(
  funcs: HandlerType[],
  params: Parameters<HandlerType> = [] as never,
) {
  return Promise.all(funcs.map((funcI) => funcI(...params)));
}

export function awaitAllSettled<HandlerType extends AnyFunction>(
  funcs: HandlerType[],
  params: Parameters<HandlerType>,
) {
  return Promise.allSettled(funcs.map((funcI) => funcI(...params)));
}

export async function catchz<PromiseType extends Promise<unknown>>(
  promise: PromiseType,
) {
  try {
    return await promise;
  } catch {
    return;
  }
}

export type AsyncItemFinder<ItemType> = (item: ItemType) => Awaitable<boolean>;
export type AsyncItemResolver<ItemType> = (
  item: ItemType,
) => Awaitable<boolean>;

export async function forEachSequentially<Type>(
  array: Type[],
  resolver: AsyncItemResolver<Type>,
) {
  for (let i = 0; i < array.length; i++) {
    await resolver(array[i] as never);
  }
}

export async function someSequentially<Type>(
  array: Type[],
  finder: AsyncItemFinder<Type>,
) {
  for (let i = 0; i < array.length; i++) {
    if (await finder(array[i] as never)) {
      return true;
    }
  }
  return false;
}

export async function everySequentially<Type>(
  array: Type[],
  finder: AsyncItemFinder<Type>,
) {
  for (let i = 0; i < array.length; i++) {
    if (!(await finder(array[i] as never))) {
      return false;
    }
  }
  return true;
}

export function isPromise(value: any): value is Promise<any> {
  return 'then' in value;
}

export async function waitForSuccess<FuncType extends AnyFunction>(
  func: FuncType,
  opts?: {
    delay?: number;
    timeout?: number;
    notNull?: boolean;
  },
): Promise<NonNullable<Awaited<ReturnType<FuncType>>>> {
  const { delay: delayAmount = 100, timeout, notNull: notNull } = opts || {};
  const startTime = Date.now();
  let lastError;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const result = await func();
      if (notNull && result == undefined) {
        throw new Error('Invalid result');
      }
      return result as never;
    } catch (error) {
      if (timeout && Date.now() - startTime > timeout) {
        throw lastError;
      }
      lastError = error;
      await delay(delayAmount);
    }
  }
}

export async function waitFor(
  fun: AnyFunction,
  options?: {
    timeout?: number;
    interval?: number;
  },
) {
  const { timeout, interval } = options || {};
  const { promise, reject, resolve } = newPromise();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    reject(new Error('Timeout'));
  }, timeout || 10000);
  try {
    do {
      if (timedOut) {
        break;
      }
      const rs = await fun();
      if (rs) {
        resolve(rs);
        break;
      }
    } while (await delay(interval || 100));
  } finally {
    clearTimeout(timer);
  }
  return promise;
}
