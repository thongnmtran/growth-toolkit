import { ModelNames } from '../common';
import { ModelDefinition } from './base';

export const AnalysisModelSchema: ModelDefinition<ModelNames.AnalysisModel> = {
  name: ModelNames.AnalysisModel,
  schema: {
    name: String,
    categories: [String],
  },
  options: {
    timestamps: false,
  },
};
