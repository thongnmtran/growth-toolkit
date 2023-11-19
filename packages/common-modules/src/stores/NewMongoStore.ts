/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ModelRef,
  MongoQuery,
  MongoQueryOptions,
  NewDoc,
  PartialDoc,
} from '@growth-toolkit/common-models';
import type { Cursor, QueryOptions, UpdateQuery } from 'mongoose';
import { BulkWriteResult, UpdateManyResult } from './mongoose-types';
import { DataStoreAPIMap, NewDataStore } from './NewDataStore';

// Create
export type MongoCreateInput<Model> = Partial<Model>;
export type MongoCreateOutput<Model> = Doc<Model>;
export type MongoCreateManyInput<Model> = Partial<Model>[];
export type MongoCreateManyOutput<Model> = Doc<Model>[];

// Update
export type MongoUpdateInput<Model> =
  | {
      doc: PartialDoc<Model>;
    }
  | {
      update: UpdateQuery<Model>;
      where: MongoQuery<Model>;
      options?: QueryOptions<Model>;
    };
export type MongoUpdateOutput<Model> = Doc<Model>;
export type MongoUpdateManyInput<Model> =
  | {
      docs: Partial<Model>[];
      keyFields?: (keyof Model)[];
    }
  | {
      update: Partial<Model>;
      where: MongoQuery<Model>;
      options?: QueryOptions<Model> & { rawResult: true };
    };
export type MongoUpdateManyOutput = BulkWriteResult | UpdateManyResult;

// Create or Update
export type MongoCreateOrUpdateInput<Model> = {
  doc: PartialDoc<Model>;
  where?: MongoQuery<PartialDoc<Model>>;
};
export type MongoCreateOrUpdateOutput<Model> = Doc<Model>;

export type MongoCreateOrUpdateManyInput<Model> = {
  docs: (
    | PartialDoc<Model>
    | {
        where: MongoQuery<NewDoc<Model>>;
        doc: PartialDoc<Model>;
      }
  )[];
  options?: {
    returnDocs: boolean;
  };
};
export type MongoCreateOrUpdateManyOutput<Model> = Doc<Model>[];

// Find
export type MongoFindInput<Model> = {
  options?: MongoQueryOptions<Model>;
} & (
  | {
      query: MongoQuery<Model>;
    }
  | {
      ref: ModelRef<Model>;
    }
);
export type MongoFindOutput<Model> = Doc<Model> | undefined;
export type MongoFindManyInput<Model> = {
  options?: MongoQueryOptions<Model>;
} & (
  | {
      query: MongoQuery<Model>;
    }
  | {
      refs: ModelRef<Model>[];
    }
);
export type MongoFindManyOutput<Model> = Doc<Model>[];

export type MongoCursorInput<Model> = MongoFindManyInput<Model>;
export type MongoCursorOutput<Model> = Cursor<Doc<Model>>;

// Delete
export type MongoDeleteInput<Model> =
  | {
      where: MongoQuery<Model>;
    }
  | {
      ref: ModelRef<Model>;
    }
  | {
      refs: ModelRef<Model>[];
    };
export type MongoDeleteOutput = void;

export type MongoStoreAPIMap<Model> = DataStoreAPIMap<
  MongoCreateInput<Model>,
  MongoCreateOutput<Model>,
  MongoCreateManyInput<Model>,
  MongoCreateManyOutput<Model>,
  MongoUpdateInput<Model>,
  MongoUpdateOutput<Model>,
  MongoUpdateManyInput<Model>,
  MongoUpdateManyOutput,
  MongoCreateOrUpdateInput<Model>,
  MongoCreateOrUpdateOutput<Model>,
  MongoCreateOrUpdateManyInput<Model>,
  MongoCreateOrUpdateManyOutput<Model>,
  MongoFindInput<Model>,
  MongoFindOutput<Model>,
  MongoFindManyInput<Model>,
  MongoFindManyOutput<Model>,
  MongoCursorInput<Model>,
  MongoCursorOutput<Model>,
  MongoDeleteInput<Model>,
  MongoDeleteOutput
>;

export type NewMongoStore<Model> = NewDataStore<MongoStoreAPIMap<Model>>;
