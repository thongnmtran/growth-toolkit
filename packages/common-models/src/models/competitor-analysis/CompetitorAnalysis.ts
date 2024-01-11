import { ExcelFile } from '../analysis';
import { CompetitorModelDoc } from './CompetitorModel';

export type CompetitorAnalysis = {
  name: string;
  productColumn: string;
  model: CompetitorModelDoc['_id'];
  dataUri: string;
  excelFile?: ExcelFile;
};

export type CompetitorAnalysisDoc = Doc<CompetitorAnalysis>;
