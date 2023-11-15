import { Nullable } from '../types';

export function addNullable(
  a: Nullable<number>,
  b: Nullable<number>
): number | undefined {
  if (a == null || b == null) {
    return undefined;
  }
  return a + b;
}

export function subtractNullable(
  a: Nullable<number>,
  b: Nullable<number>
): number | undefined {
  if (a == null || b == null) {
    return undefined;
  }
  return a - b;
}

export function divideNullable(
  a: Nullable<number>,
  b: Nullable<number>
): number | undefined {
  if (a == null || b == null) {
    return undefined;
  }
  return a / b;
}

export function multiplyNullable(
  a: Nullable<number>,
  b: Nullable<number>
): number | undefined {
  if (a == null || b == null) {
    return undefined;
  }
  return a * b;
}
