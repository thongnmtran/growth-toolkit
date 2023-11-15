/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  AnyKey,
  AnyObject,
  Fragment,
  FragmentExcept,
  RecursivePartial,
} from '../types';
import _ from 'lodash';
import { safeCall } from './function-utils';

export function mustBeArray(value: unknown): value is [] {
  return Array.isArray(value);
}

export function isObject(value: unknown): value is AnyObject {
  const type = typeof value;
  return type === 'object' && !mustBeArray(value);
}

export function defaultUndefined(testValue: unknown, value: unknown) {
  if (value === undefined) {
    value = testValue;
  }
  return testValue != null ? value : undefined;
}

export function assign(dest: any, src: any, ...props: any[]) {
  if (props.length) {
    props.forEach((key) => {
      dest[key] = src[key];
    });
  } else {
    Object.assign(dest, src);
  }
  return dest;
}

export function fragment<Type, Keys extends keyof Type>(
  object: Type,
  ...props: Keys[]
): Fragment<Type, Keys> {
  const clone: any = {};
  props.forEach((propI) => {
    clone[propI] = object[propI];
  });
  return clone;
}

/**
 * Exclude some fields recursive
 */
export function fragmentExcept<
  Type extends object,
  ExceptKeys extends keyof Type
>(
  object: Type,
  ...excludedProps: ExceptKeys[]
): FragmentExcept<Type, ExceptKeys> {
  const clone: Type = {} as never;
  Object.keys(object).forEach((key) => {
    if (!excludedProps.includes(key as never)) {
      const value = object[key as never] as never;
      assign(clone, { [key]: value });
    }
  });
  return clone;
}

export function fragmentExceptNoType(
  object: any,
  ...excludedProps: string[]
): any {
  const clone: any = {};
  Object.keys(object).forEach((key) => {
    if (!excludedProps.includes(key)) {
      const value = _.get(object, key);
      assign(clone, { [key]: value });
    }
  });
  return clone;
}

export function jsonClone<Type>(
  object: Type,
  defaultValue: any = {},
  exceptProps: AnyKey[] = []
): Type {
  try {
    const clone = JSON.parse(JSON.stringify(object));
    if (Array.isArray(exceptProps)) {
      exceptProps.forEach((propI) => delete clone[propI]);
    }
    return clone;
  } catch (error) {
    return defaultValue;
  }
}

export function deepClone<ValueType>(
  value: ValueType,
  options?: {
    excludedKeys?: Array<keyof ValueType>;
  }
): ValueType {
  const { excludedKeys = [] } = options || {};

  if (Array.isArray(value)) {
    return value.map((itemI) => deepClone(itemI, options)) as ValueType;
  }

  if (typeof value === 'object' && value) {
    const entries = Object.entries(value).filter(
      ([keyI]) => !excludedKeys?.includes(keyI as never)
    );
    return entries.reduce((objectClone, [key, value]) => {
      objectClone[key] = deepClone(value, options);
      return objectClone;
    }, {} as any);
  }

  return value;
}

export function valueOf(value: any, ...args: unknown[]) {
  return typeof value === 'function' ? value(...args) : value;
}

export function map(keyMap: any, nameMap: any) {
  return Object.values(keyMap).reduce((prev: any, cur: any) => {
    prev[cur] = nameMap[cur];
    return prev;
  }, {} as any);
}

export function isNotSameObject(a: unknown, b: unknown) {
  return !isSameObject(a, b);
}

export function isSameObject(
  objectA: unknown,
  objectB: unknown,
  excludedKeys: Array<keyof typeof objectA | keyof typeof objectB> = []
) {
  const a = jsonClone(objectA, objectA, excludedKeys);
  const b = jsonClone(objectB, objectB, excludedKeys);
  return a === b || JSON.stringify(a) === JSON.stringify(b);
}

export function asString(object: any): string {
  return typeof object === 'string' ? object : JSON.stringify(object);
}

export function asObject<ObjectType = any>(raw: any): ObjectType {
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

export function safeAsObject<ObjectType = any>(raw: any): ObjectType {
  return safeCall(() => asObject(raw));
}

export function isEmptyValue(value: unknown) {
  return (
    value == null ||
    (Array.isArray(value) && value.length <= 0) ||
    (typeof value === 'object' && Object.keys(value).length <= 0)
  );
}

export function isNonEmptyValue(value: unknown) {
  return !isEmptyValue(value);
}

export function asNonNull<Type>(value: Type): NonNullable<Type> {
  return value as never;
}

export function queryObjects<Type>(
  data: Type[],
  query: RecursivePartial<Type>
) {
  return data.filter((item) => isMatchedObject(item, query));
}

export function isMatchedObject<Type>(
  object: Type,
  query: RecursivePartial<Type>
): boolean {
  for (const key in query) {
    const queryValue = query[key];
    const objectValue = object[key];
    if (Array.isArray(queryValue)) {
      return (
        Array.isArray(objectValue) &&
        queryValue.every((item) => objectValue.includes(item))
      );
    } else if (typeof queryValue === 'object' && queryValue != null) {
      return isMatchedObject<typeof objectValue>(objectValue, queryValue);
    } else if (queryValue !== objectValue) {
      return false;
    }
  }
  return true;
}
