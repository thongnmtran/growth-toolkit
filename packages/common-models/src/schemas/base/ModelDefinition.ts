/* eslint-disable @typescript-eslint/no-explicit-any */
import { FlatRecord, SchemaOptions, VirtualTypeOptions } from 'mongoose';
import { ModelMap, ModelNames } from '../../common';
import { ModelSchema } from './ModelSchema';

type AsVirtualFields<Model> = {
  [Prop in keyof Model]?: VirtualTypeOptions<Model, Model>;
};

export type ModelDefinition<
  ModelName extends ModelNames = any,
  Plugins = any
> = {
  name: ModelName;
  schema: ModelSchema<ModelMap[ModelName]>;
  options?: SchemaOptions<FlatRecord<ModelMap[ModelName]>>;
  plugins?: Plugins[];
  virtualFields?: AsVirtualFields<ModelMap[ModelName]>;
};
