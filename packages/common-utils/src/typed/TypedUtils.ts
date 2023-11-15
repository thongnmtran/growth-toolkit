import type { Nullable } from '../types';
import type { ExtractType, Typed } from './Typed';

// --- Create & Update

export function replaceValues<TypedTypeLike extends Typed>(
  values: TypedTypeLike[],
  ...newValues: TypedTypeLike[]
) {
  const resolvedTypes: TypedTypeLike['type'][] = [];
  newValues.forEach((valueI) => {
    if (resolvedTypes.includes(valueI.type)) {
      return;
    }
    resolvedTypes.push(valueI.type);

    const resultsOfType = findValues(newValues, valueI.type);
    removeValues(values, valueI.type);
    values.push(...resultsOfType);
  });
}

export function pushValues(values: Typed[], ...newValues: Typed[]) {
  return values.push(...newValues);
}

export function insertValuesBefore(
  values: Typed[],
  anchor: Typed | null,
  ...newValues: Typed[]
) {
  let anchorIndex = values.indexOf(anchor as never);
  if (anchorIndex === -1) {
    anchorIndex = 0;
  }
  return values.splice(anchorIndex, 0, ...newValues);
}

export function insertValuesAfter(
  values: Typed[],
  anchor: Typed | null,
  ...newValues: Typed[]
) {
  let anchorIndex = values.indexOf(anchor as never);
  if (anchorIndex === -1) {
    anchorIndex = values.length;
  }
  return values.splice(anchorIndex + 1, 0, ...newValues);
}

// --- Read

export interface TypedFilter<TypedTypeLike extends Typed> {
  (valueI: TypedTypeLike): Nullable<boolean>;
}

export function findValues<
  TypedTypeLike extends Typed,
  ValueType extends TypedTypeLike['type']
>(
  values: TypedTypeLike[],
  valueType: ValueType,
  filter: TypedFilter<TypedTypeLike> = () => true
): ExtractType<TypedTypeLike, ValueType>[] {
  return values.filter(
    (valueI) => valueI.type === valueType && filter(valueI as TypedTypeLike)
  ) as never;
}

export interface TypedFinder<TypedTypeLike extends Typed> {
  (valueI: TypedTypeLike): Nullable<boolean>;
}

export function findValue<
  TypedTypeLike extends Typed,
  ValueType extends TypedTypeLike['type']
>(
  values: TypedTypeLike[],
  valueType: ValueType,
  finder: TypedFilter<TypedTypeLike> = () => true
): ExtractType<TypedTypeLike, ValueType> | undefined {
  return values.find(
    (valueI) => valueI.type === valueType && finder(valueI as TypedTypeLike)
  ) as never;
}

export function findValueWithCheck<
  TypedTypeLike extends Typed,
  ValueType extends TypedTypeLike['type']
>(
  values: TypedTypeLike[],
  valueType: ValueType,
  errorMessage = `Cannot find any value with type ${String(valueType)}`,
  finder: TypedFilter<TypedTypeLike> = () => true
): ExtractType<TypedTypeLike, ValueType> {
  const value = findValue(values, valueType, finder);
  if (!value) {
    throw new Error(errorMessage);
  }
  return value;
}

// --- Delete

export function removeValues<
  TypedTypeLike extends Typed,
  ValueType extends TypedTypeLike['type']
>(values: Typed[], valueType: ValueType) {
  [...values].forEach((valueI, index) => {
    if (valueI.type === valueType) {
      values.splice(index, 1);
    }
  });
}
