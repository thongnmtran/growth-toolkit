/* eslint-disable @typescript-eslint/no-explicit-any */
import { FilterQuery, QueryOptions } from 'mongoose';

export type MongoQuery<ModelType> = FilterQuery<ModelType>;
export type AnyMongoQuery<ModelType = any> = MongoQuery<ModelType>;

export type MongoQueryOptions<ModelType> = QueryOptions<ModelType>;
export type AnyMongoQueryOptions<ModelType = any> =
  MongoQueryOptions<ModelType>;
