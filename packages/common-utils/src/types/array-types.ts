export type ArrayLike<ElementType = unknown> = Array<ElementType>;

export type Unpacked<T> = T extends (infer U)[]
  ? U
  : T extends ReadonlyArray<infer U>
  ? U
  : T;

export type IsArray<Type> = Type extends unknown[] ? true : false;
