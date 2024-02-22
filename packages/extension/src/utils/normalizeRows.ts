/* eslint-disable @typescript-eslint/no-explicit-any */

export function normalizeRows(rows: any[]) {
  let allKeys: string[] = rows.reduce((acc, row) => {
    return [...acc, ...Object.keys(row)];
  }, [] as string[]);
  allKeys = [...new Set(allKeys)];
  rows.forEach((row) => {
    allKeys.forEach((key) => {
      if (!(key in row)) {
        (row as any)[key] = '';
      }
    });
  });
  return rows;
}
