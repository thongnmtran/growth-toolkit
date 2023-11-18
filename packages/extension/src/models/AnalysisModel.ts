import { ExcelFile } from './ExcelFile';

export type AnalysisModel = {
  mode: 'collect' | 'analyze';
  excelFile: ExcelFile;
  categories: string[];
  targetField: string;
  noneValues: string[];
  strongNoneValues: string[];
  noneExcluded: boolean;
  sleepMode: boolean;
};
