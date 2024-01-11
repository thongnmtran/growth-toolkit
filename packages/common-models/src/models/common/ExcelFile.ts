/* eslint-disable @typescript-eslint/no-explicit-any */
import { FileData } from './FileData';

export type ExcelFile<RowType = any> = Omit<
  FileData & {
    numRows: number;
    headers: string[];
    rows: RowType[];
  },
  'json'
>;
