/* eslint-disable @typescript-eslint/no-explicit-any */

export type Enum<Type> = {
  [key: string]: Type | string;
  [index: number]: string;
};
export type AnyEnum<Type = any> = Enum<Type>;

export type EnumValues<Type> = Type[keyof Type];

export type ExtractEnumType<EnumType extends AnyEnum> = EnumType extends Enum<
  infer Type
>
  ? Type
  : never;

export function enumValues<EnumType extends AnyEnum>(
  enumType: EnumType,
  excepts: ExtractEnumType<EnumType>[] = [],
): ExtractEnumType<EnumType>[] {
  return Object.values(enumType).filter((value) => !excepts.includes(value));
}
