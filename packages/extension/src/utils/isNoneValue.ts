export function isNoneValue(
  value: string,
  options?: {
    noneValues?: string[];
    strongNoneValues?: string[];
  },
) {
  const { noneValues = [], strongNoneValues = [] } = options || {};
  return (
    !value ||
    (value.length <= 2 && Number.isNaN(+value)) ||
    noneValues.some(
      (noneValue) =>
        noneValue.toLowerCase().trim() === value.toLowerCase().trim(),
    ) ||
    strongNoneValues.some((strongNoneValue) =>
      value.toLowerCase().includes(strongNoneValue.toLowerCase()),
    )
  );
}
