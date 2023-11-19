import { Override } from '@growth-toolkit/common-utils';
import { NewDataStore } from './NewDataStore';
import { MongoStoreAPIMap } from './NewMongoStore';
import { NewDoc } from '@growth-toolkit/common-models';

export type MongoStoreClientAPIMap<Model> = Override<
  MongoStoreAPIMap<Model>,
  {
    CreateOutput: NewDoc<Model>;
    CreateManyOutput: NewDoc<Model>[];
    UpdateOutput: NewDoc<Model>[];
    UpdateManyOutput: NewDoc<Model>[];
    CreateOrUpdateOutput: NewDoc<Model>;
    CreateOrUpdateManyOutput: NewDoc<Model>[];
    FindOutput: NewDoc<Model>;
    FindManyOutput: NewDoc<Model>[];
  }
>;

export type NewMongoStoreClient<Model> = NewDataStore<
  MongoStoreClientAPIMap<Model>
>;
