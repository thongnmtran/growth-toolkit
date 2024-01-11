import { Merge } from '@growth-toolkit/common-utils';

export enum CompetitorModelFieldType {
  YES_NO = 'YES_NO',
  NAME = 'NAME',
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  RANGE = 'RANGE',
  CATEGORIES = 'CATEGORIES',
  AUTO = 'AUTO',
  LINKEDIN_FOLLOWERS = 'LINKEDIN_FOLLOWERS',
  GOOGLE_TREND = 'GOOGLE_TREND',
}

export type CompetitorModelProperty = {
  name: string;
  type: CompetitorModelFieldType;
  prompt: string;
  options: string[];
};

export type CompetitorModel = {
  name: string;
  props: CompetitorModelProperty[];
};

export type CompetitorModelDoc = Doc<CompetitorModel>;

// ---

export type RawCompetitorModelField = Merge<
  [
    CompetitorModelProperty,
    {
      options: string;
    },
  ]
>;

export type RawCompetitorModel = Merge<
  [
    CompetitorModelDoc,
    {
      props: RawCompetitorModelField[];
    },
  ]
>;

export function toRawCompetitorModel(
  model: CompetitorModelDoc,
): RawCompetitorModel {
  return {
    ...model,
    props: model.props.map((field) => ({
      ...field,
      options: field.options.join(','),
    })),
  };
}
export function fromRawCompetitorModel(
  model: RawCompetitorModel,
): CompetitorModelDoc {
  return {
    ...model,
    props: model.props.map((field) => ({
      ...field,
      options: field.options.split(/\s*,\s*/).map((value) => value.trim()),
    })),
  };
}
