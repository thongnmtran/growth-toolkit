/* eslint-disable @typescript-eslint/no-explicit-any */
import { DocId } from './DocId';

export type ModelRef<Model> =
  | Doc<Model>['_id']
  | string
  | (Model extends { _id: any } ? Model : Doc<Model>);

export type AnyModelRef<Model = any> = ModelRef<Model>;

export type UnpackRef<RefType extends AnyModelRef | AnyModelRef[]> =
  RefType extends (infer ModelRefType)[]
    ? Exclude<ModelRefType, DocId>[]
    : Exclude<RefType, DocId>;

export type UnpackRefs<
  ModelType,
  PopulatedFields extends keyof ModelType = never,
> = {
  [Prop in keyof ModelType]: Prop extends PopulatedFields
    ? ModelType[Prop] extends AnyModelRef | AnyModelRef[]
      ? UnpackRef<ModelType[Prop]>
      : ModelType[Prop]
    : ModelType[Prop];
};
