export function isNoneValue(
  value: string,
  options?: {
    noneValues?: string[];
    strongNoneValues?: string[];
    isShort?: boolean;
  },
) {
  const { noneValues = [], strongNoneValues = [], isShort } = options || {};
  return (
    !value ||
    (!isShort && value.length <= 2 && Number.isNaN(+value)) ||
    noneValues.some(
      (noneValue) =>
        noneValue.toLowerCase().trim() === value.toLowerCase().trim(),
    ) ||
    strongNoneValues.some((strongNoneValue) =>
      value.toLowerCase().includes(strongNoneValue.toLowerCase()),
    )
  );
}
