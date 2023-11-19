import { Fragment } from '@growth-toolkit/common-utils';
import { DocId } from './DocId';

export type NewDoc<Model> = {
  _id: DocId;
  createdAt: number;
  updatedAt: number;
} & Model;

export type PartialDoc<Model> = Partial<Doc<Model>>;

export type PartialDocFragment<Model, Fields extends keyof Model> = Fragment<
  Partial<Doc<Model>>,
  Fields
>;
