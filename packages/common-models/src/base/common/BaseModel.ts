import { ExcludeType, KeyMap, Merge } from '@growth-toolkit/common-utils';
import { Doc } from './Doc';

export interface BaseModel extends Doc {
  createdAt: number;
  updatedAt: number;
}

export const BaseModelKeys: KeyMap<BaseModel> = {
  id: 'id',
  _id: '_id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

export type ModelInput<Model> = ExcludeType<Model, BaseModel>;

export type PartialModel<Model> = Merge<[Partial<Model>, BaseModel]>;

export function newModel<Model>(input: Partial<Model>): Model {
  return input as never;
}
