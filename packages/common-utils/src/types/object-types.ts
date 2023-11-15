/* eslint-disable @typescript-eslint/no-explicit-any */

export type ObjectLike<ValueType = unknown> = Record<AnyKey, ValueType>;

/**
 * @warn using this util carefully
 */
export type ValueOf<Type> = Type[keyof Type];

export type AnyKey = string | number | symbol;

export type AnyObject = Record<AnyKey, any>;

export type FieldsNullable<Type> = {
  [Prop in keyof Type]: Type[Prop] | null;
};

export type FieldsAny<Type> = {
  [Prop in keyof Type]: Type[Prop] | null | undefined;
};

/**
 * Create a fragment of Type except some fields
 */
export type FragmentExcept<Type, ExceptFields extends keyof Type> = Pick<
  Type,
  Exclude<keyof Type, ExceptFields>
>;

/**
 * Create a fragment of Type that have only some fields
 */
export type Fragment<Type, Fields extends keyof Type> = Pick<Type, Fields>;

/**
 * Omit some props of a type (Same as Omit)
 */
export type OmitProps<Type, Keys extends keyof Type> = Omit<Type, Keys>;

/**
 * Make some properties of a type as optional
 */
export type Optional<Type, Props extends keyof Type> = Omit<Type, Props> &
  Partial<Pick<Type, Props>>;

/**
 * Accept an object of a Type or an omited version of that Type.<br>
 * Use this when we want to omit some properties when passing an object of a Type
 * into a function.
 */
export type OptionalParam<Type, Props extends keyof Type> =
  | Type
  | Omit<Type, Props>;

/**
 * Create a union type which has all field in the BaseType and Sub-Types
 */
export type Union<BaseType, SubTypes extends unknown[]> = BaseType &
  (SubTypes extends [infer FirstSubType, ...infer RestSubTypes]
    ? Omit<FirstSubType, keyof BaseType> & Union<BaseType, RestSubTypes>
    : SubTypes extends [infer FirstSubType]
    ? Omit<FirstSubType, keyof BaseType>
    : BaseType);

export type FieldNameMap<Type> = {
  [Prop in keyof Type]: string;
};

export type NameMap<Type extends AnyKey, ValueType = string> = {
  [Prop in Type]: ValueType;
};

/**
 * Define a Key map type for a type
 */
export type KeyMap<Type> = {
  readonly [Prop in keyof Type]: Prop;
};

/**
 * Define a Key map type for a type
 */
export type UnionKeyMap<BaseType, SubTypes extends unknown[]> = KeyMap<
  Union<BaseType, SubTypes>
>;

/**
 * Define a map with the same keys but another value type
 */
export type ValueMap<Type extends AnyKey, NewValueType> = {
  [Prop in Type]: NewValueType;
};

/**
 * Define a map with the same keys but another value type
 */
export type ObjectValueMap<ObjectType extends object, NewValueType> = {
  [Prop in keyof ObjectType]: NewValueType;
};

export type Mutable<Type> = {
  -readonly [Prop in keyof Type]: Type[Prop];
};

export function asMutable<Type>(object: Type) {
  return object as Mutable<Type>;
}
