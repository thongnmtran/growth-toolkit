import { ExcelFile } from './ExcelFile';

export type AnalysisModel = {
  categories: string[];
  targetField: string;
  excelFile: ExcelFile;
  mode: 'collect' | 'analyze';
};
