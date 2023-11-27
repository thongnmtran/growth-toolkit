/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExcelFile } from './ExcelFile';

export enum AnalysisModelFieldType {
  TEXT = 'TEXT',
  CATEGORIZED = 'CATEGORIZED',
  RATING = 'RATING',
  YEAR = 'YEAR',
}

export type AnalysisModel = {
  name: string;
  dataUri: string;
  excelFile?: ExcelFile;
  targetField?: string;
  fieldType: AnalysisModelFieldType;
  detectingCategoriesHints?: string;
  categories: string[];
  contract: string;
  noneValues: string[];
  strongNoneValues: string[];
  noneExcluded: boolean;
};

export type AnalysisModelDoc = Doc<AnalysisModel>;

export type RawAnalysisModelDoc = AnalysisModelDoc & {
  rawCategories: string;
  rawNoneValues: string;
  rawStrongNoneValues: string;
};

export function toRawAnalysisModel(
  model: AnalysisModelDoc,
): RawAnalysisModelDoc {
  return {
    ...model,
    rawCategories: model.categories.join('\n'),
    rawNoneValues: model.noneValues.join(','),
    rawStrongNoneValues: model.strongNoneValues.join(','),
  };
}

export function toAnalysisModel(rawModel: RawAnalysisModelDoc) {
  const model: AnalysisModelDoc = {
    ...rawModel,
    categories: buildCategories(rawModel.rawCategories),
    noneValues: trimArray(rawModel.rawNoneValues.split(/,\s*/)),
    strongNoneValues: trimArray(rawModel.rawStrongNoneValues.split(/,\s*/)),
  };
  delete (model as any).rawCategories;
  delete (model as any).rawNoneValues;
  delete (model as any).rawStrongNoneValues;
  return model;
}

export function buildNoneValues(noneValues: string[] | string) {
  const noneValuesArray = Array.isArray(noneValues)
    ? noneValues
    : noneValues.split(/,|\n|\||;/);
  return trimArray(noneValuesArray);
}

export function buildContract(categories: string[] | string) {
  const categoriesArray = buildCategories(categories);
  const rawCategories = `"${categoriesArray.join('", "')}"`;
  const contract = `Categorize the following feedback into the provided categories: ${rawCategories}. Please respond with the category names only, one per line. For spam or meaningless feedback, respond with 'None'. For feedback that doesn't fit any of the above categories, respond with 'Other'.`;
  return contract;
}

/**
 * @deprecated
 * @param categories
 * @returns
 */
export function buildAssistantContract(categories: string[] | string) {
  const categoriesArray = buildCategories(categories);
  const rawCategories = `"${categoriesArray.join('", "')}"`;
  const contract = `You are a categorizer. Respond only with the category names, each category on one line. Respond with 'None' if the feedback is spam or meaningless; respond with 'Other' if no category matches. The given categories are: ${rawCategories}`;
  return contract;
}

export function buildCategories(categories: string[] | string) {
  const categoriesArray = Array.isArray(categories)
    ? categories
    : categories.split('\n');
  return trimArray(categoriesArray);
}

export function trimArray(array: string[]) {
  return array.map((c) => c.trim()).filter((c) => c);
}
