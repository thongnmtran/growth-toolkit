/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FilterQuery, QueryOptions, Unpacked } from 'mongoose';
import { ModelNames } from '../common/ModelNames';

export type SortableField<ModelType> =
  | `-${keyof ModelType extends string ? keyof ModelType : never}`
  | Extract<keyof ModelType, string>;

export type PopulateOption<
  ModelType,
  PathType extends keyof ModelType = any
> = {
  path?: keyof ModelType;
  select?: SortableField<Unpacked<ModelType[PathType]>>[];
  match?: FilterQuery<Unpacked<ModelType[PathType]>>;
  populate?:
    | string
    | string[]
    | PopulateOption<Unpacked<ModelType[PathType]>>
    | PopulateOption<Unpacked<ModelType[PathType]>>[];
  options?: QueryOptions;
};

export interface MongoDBQuery<
  ModelType,
  ModelNameType extends ModelNames = ModelNames
> {
  model?: ModelNameType;
  where?: FilterQuery<ModelType>;
  // delete?: FilterQuery<ModelType>;
  // update?: Partial<ModelType>;
  // create?: Partial<ModelType> | Partial<ModelType>[];
  // single?: boolean; // Target single doc
  sort?: SortableField<ModelType>;
  skip?: number;
  limit?: number;
  fields?: (keyof ModelType)[];
  populate?:
    | keyof ModelType
    | (keyof ModelType)[]
    | PopulateOption<ModelType>
    | PopulateOption<ModelType>[];
}
