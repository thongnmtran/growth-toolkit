/* eslint-disable @typescript-eslint/no-explicit-any */

export type TypeName =
  | 'object'
  | 'string'
  | 'number'
  | 'bigint'
  | 'boolean'
  | 'symbol'
  | 'function'
  | 'undefined';

export type AnyFunction = (...params: any[]) => any;

export type AnyOf<Type> = Type | undefined | null;

/**
 * Create a nullable type from a type
 */
export type Nullable<Type> = Type | undefined | null;

export type Awaitable<Type = unknown> = Type | Promise<Type>;

export type BooleanLike =
  | object
  | string
  | number
  | bigint
  | boolean
  | symbol
  | AnyFunction
  | undefined
  | null;

export type BooleanPromise = Awaitable<BooleanLike>;

export type EnumNames<EnumType extends string> = Partial<
  Record<EnumType, string>
>;

export type AsType<DestType, SrcType> = Extract<SrcType, DestType>;

export type AsString<Type> = AsType<string, Type>;
