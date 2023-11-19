import { ExcelFile } from './ExcelFile';

export type AnalysisModel = {
  name?: string;
  mode: 'collect' | 'analyze';
  excelFile: ExcelFile;
  categories: string[];
  contract: string;
  targetField: string;
  noneValues: string[];
  strongNoneValues: string[];
  noneExcluded: boolean;
  sleepMode: boolean;
  useAPI: boolean;
};

export type AnalysisModelDoc = Doc<AnalysisModel>;
