/* eslint-disable @typescript-eslint/no-explicit-any */
import { Nullable, TypeName, Unpacked } from '../types';

/**
 * Is array of type
 */
export function isArray<ItemType = any>(
  array: any,
  type?: TypeName,
): array is ItemType[] {
  if (!Array.isArray(array)) {
    return false;
  }
  if (type) {
    return array.every((itemI) => typeof itemI === type);
  }
  return true;
}

export function asArray<ItemType>(data: ItemType | ItemType[]): ItemType[] {
  return Array.isArray(data) ? data : [data];
}

export function asArrayIfNotNull<ItemType>(
  data: Nullable<ItemType | ItemType[]>,
): ItemType[] {
  if (Array.isArray(data)) {
    return data;
  }
  return (data == null ? [] : [data]) as never;
}

export function asNullIfEmpty<ItemType>(arrayLike?: Nullable<ItemType[]>) {
  return isEmpty(arrayLike) ? null : arrayLike;
}

export function asItem<DataType>(arrayLike: DataType): Unpacked<DataType> {
  if (Array.isArray(arrayLike)) {
    return arrayLike[0];
  }
  return arrayLike as never;
}

export function isEmpty<ItemType>(array?: Nullable<ItemType[]>) {
  return !Array.isArray(array) || array.length <= 0;
}

export function isNotEmpty<ItemType>(
  array?: ItemType | ItemType[],
): array is ItemType[] {
  return Array.isArray(array) && array.length > 0;
}

/// Query

export function getFirst<ItemType>(array?: ItemType | ItemType[]) {
  return isArray(array) ? array[0] : array;
}

/// Comparison

export type Comparator = (a: any, b: any) => boolean;

const DEFAULT_COMPARATOR: Comparator = (a, b) => a === b;

export function isSame(
  A: Readonly<any[]> | any[],
  B: Readonly<any[]> | any[],
  options?: {
    comparator?: Comparator;
    sameOrder?: boolean;
  },
) {
  if (A.length !== B.length) {
    return false;
  }
  const { comparator = DEFAULT_COMPARATOR, sameOrder } = options || {};
  if (sameOrder) {
    return A.every((a, i) => comparator(a, B[i]));
  }
  return A.every((a) => B.some((b) => comparator(a, b)));
}

export function count<ItemType>(
  array: ItemType[],
  counter: (itemI: ItemType, index: number) => boolean = () => true,
) {
  return array.reduce((total, itemI, index) => {
    return total + (counter(itemI, index) ? 1 : 0);
  }, 0);
}

export function filter<ItemType>(
  array: ItemType[],
  filter: (itemI: ItemType, index: number) => boolean = () => true,
) {
  return array.filter(filter);
}

export function filterNull<ItemType>(
  array: ItemType[],
): NonNullable<ItemType>[] {
  return array.filter((itemI) => itemI) as never;
}

function isEmptyObject(value: unknown) {
  return (
    !value ||
    (Array.isArray(value) && value.length <= 0) ||
    (typeof value === 'object' && Object.keys(value).length <= 0)
  );
}

export function filterEmptyObject<ItemType>(
  array: ItemType[],
): NonNullable<ItemType>[] {
  return array.filter((itemI) => !isEmptyObject(itemI)) as never;
}

export function sort<ItemType>(array: ItemType[] = [], ...criteriaz: string[]) {
  const criteria = criteriaz
    .flat()
    .filter((criterionI) => criterionI)
    .map((criterion) => ({
      direction: criterion.startsWith('-') ? -1 : 1,
      prop: criterion.startsWith('-') ? criterion.slice(1) : criterion,
    }));

  return (array as any[]).sort((a, b) => {
    let diff = 0;
    criteria.some((criterion) => {
      if (a[criterion.prop] == null && b[criterion.prop] != null) {
        diff = -10;
        return true;
      }
      if (b[criterion.prop] == null && a[criterion.prop] != null) {
        diff = 10;
        return true;
      }
      const aVal = a[criterion.prop] != null ? a[criterion.prop] : 0;
      const bVal = b[criterion.prop] != null ? b[criterion.prop] : 0;
      if (typeof aVal === 'string' || typeof bVal === 'string') {
        diff = (aVal || '').toString().localeCompare(bVal as never);
      } else {
        diff = aVal - bVal;
      }
      diff *= criterion.direction;
      return diff !== 0;
    });
    return diff;
  });
}

export type ConditionalMergeItem<ItemType> = {
  if: boolean;
  value: ItemType | ItemType[];
};

export type MergeItem<ItemType> =
  | ItemType
  | ItemType[]
  | ConditionalMergeItem<ItemType>;

function isConditionalMergeItem<ItemType>(
  mergeItem: MergeItem<ItemType>,
): mergeItem is ConditionalMergeItem<ItemType> {
  return (
    mergeItem &&
    typeof mergeItem === 'object' &&
    'if' in mergeItem &&
    'value' in mergeItem
  );
}

export function mergeArray<ItemType>(
  ...mergeItems: MergeItem<ItemType>[]
): ItemType[] {
  const array: ItemType[] = [];
  mergeItems.forEach((mergeItemI) => {
    if (isArray(mergeItemI)) {
      array.push(...mergeItemI);
    } else if (isConditionalMergeItem(mergeItemI)) {
      if (mergeItemI.if) {
        array.push(...asArray(mergeItemI.value));
      }
    } else {
      array.push(mergeItemI);
    }
  });
  return array;
}

export type ItemComparator<ItemType> = (
  a?: Nullable<ItemType>,
  b?: Nullable<ItemType>,
) => boolean;

export type ItemFinder<ItemType> = (item: ItemType) => boolean;

export const DEFAULT_ITEM_FINDER: ItemFinder<unknown> = () => true;

export const DEFAULT_ITEM_COMPARATOR: ItemComparator<unknown> = (a, b) =>
  a === b;

export function arrayContains<ItemType>(
  array: ItemType[],
  items: ItemType[],
  comparator: ItemComparator<ItemType> = DEFAULT_ITEM_COMPARATOR,
) {
  return items.every((itemI) => {
    return !!array.some((itemJ) => comparator(itemI, itemJ));
  });
}

/// Mutation

export function removeWhere<ItemType = unknown>(
  array: ItemType[],
  finder: ItemFinder<ItemType> = DEFAULT_ITEM_FINDER,
  options?: {
    clone?: boolean;
  },
) {
  const targetArray = options?.clone ? [...array] : array;
  [...array].forEach((itemI, index) => {
    if (finder(itemI)) {
      targetArray.splice(index, 1);
    }
  });
  return targetArray;
}

export function removeItems<ItemType = unknown>(
  array: ItemType[],
  items: ItemType[],
  comparator: ItemComparator<ItemType> = DEFAULT_ITEM_COMPARATOR,
  options?: {
    clone?: boolean;
  },
) {
  const targetArray = options?.clone ? [...array] : array;
  items.forEach((itemI) => {
    const index = targetArray.findIndex((itemJ) => comparator(itemI, itemJ));
    if (index >= 0) {
      targetArray.splice(index, 1);
    }
  });
  return targetArray;
}

export function toggleItem<ItemType>(
  array: ItemType[],
  items: ItemType[],
  comparator: ItemComparator<ItemType> = DEFAULT_ITEM_COMPARATOR,
) {
  items.forEach((itemI) => {
    let found = false;
    [...array].forEach((itemJ, indexJ) => {
      if (comparator(itemI, itemJ)) {
        array.splice(indexJ, 1);
        found = true;
      }
    });
    if (!found) {
      array.push(itemI);
    }
  });
  return array;
}

export function addItems<ItemType>(
  array: ItemType[],
  items: ItemType[],
  comparator: ItemComparator<ItemType> = DEFAULT_ITEM_COMPARATOR,
) {
  items.forEach((itemI) => {
    const found = array.some((itemJ) => comparator(itemI, itemJ));
    if (!found) {
      array.push(itemI);
    }
  });
}

export function clearArray<ItemType>(array: ItemType[]) {
  array.splice(0, array.length);
  return array;
}

export function replaceArray<ItemType>(array: ItemType[], items: ItemType[]) {
  array.splice(0, array.length, ...items);
  return array;
}

export function reuseArray<ItemType>(
  tempArray: ItemType[],
  persistentArray: ItemType[],
  comparator: ItemComparator<ItemType> = DEFAULT_ITEM_COMPARATOR,
) {
  return filterNull(
    tempArray.map((tempItemI) =>
      persistentArray.find((persistentItemI) =>
        comparator(tempItemI, persistentItemI),
      ),
    ),
  );
}

export function unique<ItemType>(array: ItemType[]) {
  return Array.from(new Set(array));
}
