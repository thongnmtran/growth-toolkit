import type { Model } from 'mongoose';
import { ModelNames } from './ModelNames';
import {
  AnalysisModel,
  AnalysisSession,
  CompetitorAnalysis,
  CompetitorAnalysisSession,
} from '../models';
import { CompetitorModel } from '../models/competitor-analysis/CompetitorModel';

export interface ModelMap {
  [ModelNames.AnalysisModel]: AnalysisModel;
  [ModelNames.AnalysisSession]: AnalysisSession;
  [ModelNames.CompetitorModel]: CompetitorModel;
  [ModelNames.CompetitorAnalysis]: CompetitorAnalysis;
  [ModelNames.CompetitorAnalysisSession]: CompetitorAnalysisSession;
}

export type MongoModelMap = {
  [Prop in keyof ModelMap]: Model<ModelMap[Prop]>;
};
