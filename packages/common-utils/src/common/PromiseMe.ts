/* eslint-disable @typescript-eslint/no-explicit-any */
import { Awaitable } from '../types';
import {
  NullablePromiseReturn,
  PromiseReturn,
  PromiseReturnMany,
} from './promise-utils';

export class PromiseMe<ItemType> {
  constructor(public array: ItemType[]) {}

  /**
   * Run all, but only return the last result
   */
  async last<FuncType extends (item: ItemType) => Promise<any>>(
    func: FuncType
  ): PromiseReturn<FuncType> {
    const rs = await this.all(func);
    return rs.at(-1) as never;
  }

  /**
   * Run all, but only return the first result
   */
  async defer<FuncType extends (item: ItemType) => Promise<any>>(
    func: FuncType
  ): PromiseReturn<FuncType> {
    const rs = await this.all(func);
    return rs[0] as never;
  }

  async all<FuncType extends (item: ItemType) => Promise<any>>(
    func: FuncType
  ): PromiseReturnMany<FuncType> {
    const rs = await Promise.all(
      this.array.map((itemI) => {
        return func(itemI);
      })
    );
    return rs;
  }

  /**
   * Run synchronously
   */
  async pipe<ReturnType>(
    func: (item: ItemType, prev?: ReturnType) => Awaitable<ReturnType>
  ) {
    return this.#pipe<ReturnType>(this.array, func);
  }

  /**
   * Run synchronously
   */
  async reversePipe<ReturnType>(
    func: (item: ItemType, prev?: ReturnType) => Awaitable<ReturnType>
  ) {
    return this.#pipe<ReturnType>([...this.array].reverse(), func);
  }

  /**
   * Run synchronously
   */
  async #pipe<ReturnType>(
    array: ItemType[],
    func: (item: ItemType, prev?: ReturnType) => Awaitable<ReturnType>
  ): Promise<ReturnType | undefined> {
    let lastValue: ReturnType | undefined = undefined;
    for (const itemI of array) {
      const value: any = await func(itemI, lastValue);
      lastValue = value;
    }
    return lastValue;
  }

  /**
   * Run synchronously, return the first non-null value
   */
  async some<FuncType extends (store: ItemType) => Promise<any>>(
    func: FuncType
  ): NullablePromiseReturn<FuncType> {
    for (const itemI of this.array) {
      const rs = await func(itemI);
      if (rs) {
        return rs as never;
      }
    }
    return undefined as never;
  }

  /**
   * Run asynchronously, return the first non-null value. Stop if an error occur.
   */
  async race<FuncType extends (store: ItemType) => any>(func: FuncType) {
    const rs = await Promise.race(this.array.map(func));
    return rs;
  }

  /**
   * Run asynchronously, return the first non-null value.  Not stop if an error occur.
   */
  async any<FuncType extends (store: ItemType) => any>(func: FuncType) {
    const rs = await Promise.any(this.array.map(func));
    return rs;
  }
}
