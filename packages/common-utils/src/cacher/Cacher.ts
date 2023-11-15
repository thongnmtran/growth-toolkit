/* eslint-disable @typescript-eslint/no-explicit-any */
import { AwaitedReturn, hash, isPromise } from '../common';
import { AnyFunction } from '../types';

let cacherId = 0;

export type CacheOptions<Type extends object = any> = {
  timeout?: number;
  cleaner?: (value: Type) => unknown;
};

export type CacheRecord<Type extends object = any> = {
  ref: WeakRef<Type> | Type;
  usedAt: number;
  options?: CacheOptions<Type>;
};

export class Cacher {
  #cache = new Map<unknown, CacheRecord>();
  #garbageCollectorTimer = 0;

  debug = false;
  name = '';
  defaultTimeout?: number;

  constructor(name = '') {
    this.name = `cacher/${name}/${++cacherId}`;
  }

  public call<FetcherTye extends AnyFunction>(
    fetcher: FetcherTye,
    params: Parameters<FetcherTye>,
    options?: CacheOptions<AwaitedReturn<FetcherTye>>
  ): ReturnType<FetcherTye> {
    return this.get(params, () => fetcher(...params), options) as never;
  }

  public has(rawKey: unknown) {
    const record = this.#getRecord(rawKey);
    if (!record) {
      return false;
    }
    const value = this.#getRecordValue(record);
    // Only objects are cachable
    if (!value) {
      this.#delete(rawKey);
    }
    return value;
  }

  public get<KeyType, ValueType extends object>(
    rawKey: KeyType,
    fetcher: (key: KeyType) => ValueType,
    options?: CacheOptions<Awaited<ValueType>>
  ): ValueType {
    if (this.has(rawKey)) {
      this.log('> Reuse:', this.#buildKey(rawKey));
      return this.#getValue(rawKey); // Always non null (Already checked in the has method)
    }
    this.log('> Fetch:', this.#buildKey(rawKey));
    const value = fetcher(rawKey);
    return this.save(rawKey, value, options);
  }

  public save<ValueType extends object>(
    rawKey: unknown,
    value: ValueType,
    options?: CacheOptions
  ): ValueType {
    if (isPromise(value)) {
      return value.then((realValue) => {
        return this.#save(rawKey, realValue, options);
      }) as never;
    } else {
      return this.#save(rawKey, value, options);
    }
  }

  #save<ValueType extends object>(
    rawKey: unknown,
    value: ValueType,
    options?: CacheOptions
  ): ValueType {
    if (value == null) {
      return undefined as any;
    }
    const cacheRecord = {
      usedAt: Date.now(),
      options,
    } as CacheRecord<ValueType>;

    let finalValue = value;
    if (options?.timeout) {
      finalValue = new Proxy(value, {
        get(target, p, receiver) {
          cacheRecord.usedAt = Date.now();
          return Reflect.get(target, p, receiver);
        },
        set(target, p, newValue, receiver) {
          cacheRecord.usedAt = Date.now();
          return Reflect.set(target, p, newValue, receiver);
        },
      });
      cacheRecord.ref = finalValue;
    } else {
      const weakRef = new WeakRef(finalValue);
      cacheRecord.ref = weakRef;
    }

    this.#cache.set(this.#buildKey(rawKey), cacheRecord);
    this.startAutoCollectGarbage();
    return finalValue;
  }

  // --- Private methods

  private startAutoCollectGarbage() {
    if (this.#garbageCollectorTimer) {
      return;
    }
    const thisRef = new WeakRef(this);
    const timer = setInterval(() => {
      this.collectGarbage();
      if (!thisRef.deref()) {
        clearInterval(timer);
      }
    }, 1000);
    this.#garbageCollectorTimer = timer as never;
  }

  private stopAutoCollectGarbage() {
    clearInterval(this.#garbageCollectorTimer);
    this.#garbageCollectorTimer = 0;
    this.log('> Cacher has been stopped');
  }

  private collectGarbage() {
    this.#cache.forEach((recordI, hashedKey) => {
      const value = this.#getRecordValue(recordI);
      if (!value || this.#isExpired(recordI)) {
        this.log('> Collect garbage:', hashedKey);
        try {
          recordI.options?.cleaner?.(value);
        } catch (error) {
          console.warn('> Clean up error:', error);
        }
        this.#cache.delete(hashedKey);
      }
    });
    if (this.#cache.size <= 0) {
      this.stopAutoCollectGarbage();
    }
  }

  private log(...msgs: unknown[]) {
    if (!this.debug) {
      return;
    }
    console.log(`[${this.name}]`, ...msgs);
  }

  // --- Primitives

  #isExpired(record: CacheRecord) {
    return (
      record.options?.timeout &&
      Date.now() - record.usedAt > record.options?.timeout
    );
  }

  #buildKey(rawKey: unknown) {
    return hash(rawKey);
  }

  #getValue(rawKey: unknown) {
    const record = this.#getRecord(rawKey);
    return this.#getRecordValue(record);
  }

  #getRecordValue(record?: CacheRecord) {
    return record?.ref instanceof WeakRef ? record.ref.deref() : record?.ref;
  }

  #getRecord(rawKey: unknown) {
    return this.#cache.get(this.#buildKey(rawKey));
  }

  #delete(rawKey: unknown) {
    this.#cache.delete(this.#buildKey(rawKey));
  }
}
