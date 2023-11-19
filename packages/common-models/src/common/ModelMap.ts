import { Model } from 'mongoose';
import { ModelNames } from './ModelNames';
import { AnalysisModel } from '../models';

export interface ModelMap {
  [ModelNames.AnalysisModel]: AnalysisModel;
}

export type MongoModelMap = {
  [Prop in keyof ModelMap]: Model<ModelMap[Prop]>;
};
