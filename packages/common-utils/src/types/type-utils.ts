import { AnyKey } from './object-types';
import { AnyFunction } from './primitive-types';

/**
 * Merge multiple types into once, the next type will override the previous one
 */
export type Merge<Types extends unknown[]> = Types extends [
  infer FirstType,
  infer SecondType,
  ...infer RestTypes
]
  ? Omit<FirstType, keyof Merge<[SecondType, ...RestTypes]>> &
      Merge<[SecondType, ...RestTypes]>
  : Types extends [infer FirstType, infer SecondType]
  ? Omit<FirstType, keyof SecondType> & SecondType
  : Types extends [infer FirstType]
  ? FirstType
  : unknown;

export type AsOverride<MainType> = {
  [Prop in keyof MainType]?: unknown;
};

/**
 * Merge multiple types into once, the next type will override the previous one
 */
export type Override<
  MainType,
  OverrideTypes extends AsOverride<MainType>
> = Merge<[MainType, OverrideTypes]>;

/**
 * Extract keys from a `Type` that have value type within `ValueType`
 */
export type KeysOf<Type, ValueType = unknown> = {
  [Prop in keyof Type]: Type[Prop] extends ValueType ? Prop : never;
}[keyof Type];

/**
 * Extract value types of a `Type` except `undefined`
 */
export type RequiredValues<Type> = Exclude<Type[keyof Type], undefined>;

/**
 * Get required keys of a `Type`
 */
export type RequiredKeys<Type> = Exclude<
  KeysOf<Type, RequiredValues<Type>>,
  undefined
>;

/**
 * Get optional keys of a `Type`
 */
export type OptionalKeys<Type> = Exclude<keyof Type, RequiredKeys<Type>>;

/**
 * Extract optional props as a fragment from a `Type`
 */
export type OptionalFragment<Type> = Required<Pick<Type, OptionalKeys<Type>>>;

/**
 * Extract required props as a fragment from a `Type`
 */
export type RequiredFragment<Type> = Pick<Type, RequiredKeys<Type>>;

/**
 * Extract method types from a `Type`
 */
export type MethodsOf<Type> = {
  [Prop in keyof Type]: Type[Prop] extends AnyFunction ? Type[Prop] : never;
}[keyof Type];

/**
 * Extract method names from a `Type`
 */
export type MethodNames<Type> = Exclude<
  KeysOf<Type, MethodsOf<Type>>,
  undefined
>;

export type ExcludeKeys<Type, Keys extends AnyKey> = Omit<Type, Keys>;

export type ExcludeType<Type, ParentType> = ExcludeKeys<Type, keyof ParentType>;

/**
 * Map a `Type` to a new `Type` with all props are optional recursively
 */
export type RecursivePartial<Type> = {
  [Prop in keyof Type]?: Type[Prop] extends (infer U)[]
    ? RecursivePartial<U>[]
    : Type[Prop] extends object
    ? RecursivePartial<Type[Prop]>
    : Type[Prop];
};

/**
 * Extract method keys from a `Type`
 */
export type MethodKeys<Type> = {
  [Prop in keyof Type]: Type[Prop] extends AnyFunction ? Prop : never;
}[keyof Type];
