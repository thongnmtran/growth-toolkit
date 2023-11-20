import type { Model } from 'mongoose';
import { ModelNames } from './ModelNames';
import { AnalysisModel, AnalysisSession } from '../models';

export interface ModelMap {
  [ModelNames.AnalysisModel]: AnalysisModel;
  [ModelNames.AnalysisSession]: AnalysisSession;
}

export type MongoModelMap = {
  [Prop in keyof ModelMap]: Model<ModelMap[Prop]>;
};
