/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Typed<TypedType = string> {
  type: TypedType;
}

export interface TypedValue<ValueType = any, TypedType = string> {
  type: TypedType;
  value: ValueType;
}

export type ExtractType<
  TypeUnion extends Typed,
  Type extends TypeUnion["type"]
> = Extract<TypeUnion, Typed<Type>>;

export type ExtractValueType<
  TypeUnion extends TypedValue,
  Type extends TypeUnion["type"]
> = ExtractType<TypeUnion, Type>["value"];
