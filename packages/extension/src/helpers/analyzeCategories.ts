import { isNoneValue } from '@/utils/isNoneValue';
import { buildNoneValues } from '@growth-toolkit/common-models';

export function analyzeCategories(
  rows: string[],
  options: { noneValues?: string[]; strongNoneValues?: string[] },
) {
  const allCategories: string[] = [];
  rows.forEach((row) => {
    const fieldValue = row;
    if (isNoneValue(fieldValue, options)) {
      return;
    }

    const categories = buildNoneValues(fieldValue);
    categories.forEach((category) => {
      if (!allCategories.includes(category)) {
        allCategories.push(category);
      }
    });
  });
  return allCategories;
}
