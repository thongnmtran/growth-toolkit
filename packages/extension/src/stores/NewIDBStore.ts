/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ensureId,
  getId,
  getIds,
  ModelNames,
} from '@growth-toolkit/common-models';
import {
  MongoCreateInput,
  MongoCreateManyInput,
  MongoCreateManyOutput,
  MongoCreateOrUpdateInput,
  MongoCreateOrUpdateManyInput,
  MongoCreateOrUpdateManyOutput,
  MongoCreateOrUpdateOutput,
  MongoCreateOutput,
  MongoCursorInput,
  MongoCursorOutput,
  MongoDeleteInput,
  MongoDeleteOutput,
  MongoFindInput,
  MongoFindManyInput,
  MongoFindManyOutput,
  MongoFindOutput,
  MongoUpdateInput,
  MongoUpdateManyInput,
  MongoUpdateManyOutput,
  MongoUpdateOutput,
  NewMongoStore,
} from '@growth-toolkit/common-modules';
import { fragmentExcept } from '@growth-toolkit/common-utils';
import { IDBManager } from './IDBManager';
import sift from 'sift';
import { IDBPObjectStore } from 'idb';

export class NewIDBStore<Model extends object> implements NewMongoStore<Model> {
  constructor(public modelName: ModelNames) {}

  get transaction() {
    return IDBManager.instance.db.transaction(this.modelName, 'readwrite');
  }

  get readOnlyTransaction() {
    return IDBManager.instance.db.transaction(this.modelName, 'readonly');
  }

  get store(): IDBPObjectStore<Model, [], any, 'readwrite'> {
    return this.transaction.store as never;
  }

  get readOnlyStore(): IDBPObjectStore<Model> {
    return this.readOnlyTransaction.store as never;
  }

  async find(params: MongoFindInput<Model>): Promise<MongoFindOutput<Model>> {
    if ('query' in params) {
      let cursor = await this.readOnlyStore.openCursor();

      const matcher = sift(params.query);
      while (cursor) {
        if (matcher(cursor.value)) {
          return cursor.value;
        }
        cursor = await cursor.continue();
      }

      return undefined;
    }

    if ('ref' in params) {
      return this.readOnlyStore.get(params.ref as never);
    }

    return;
  }

  async findMany(
    params: MongoFindManyInput<Model>,
  ): Promise<MongoFindManyOutput<Model>> {
    if ('query' in params) {
      let cursor = await this.readOnlyStore.openCursor();

      const docs: any[] = [];
      const matcher = sift(params.query);
      while (cursor) {
        if (matcher(cursor.value)) {
          docs.push(cursor.value);
        }
        cursor = await cursor.continue();
      }

      return docs;
    }

    if ('refs' in params) {
      const store = this.readOnlyStore;
      const ids = getIds(params.refs);
      return Promise.all(ids.map((id) => store.get(id as never))) as never;
    }

    return [];
  }

  cursor(params: MongoCursorInput<Model>): MongoCursorOutput<Model> {
    if ('query' in params) {
      const cursor = this.store.openCursor();
      return cursor as never;
    }
    if ('refs' in params) {
      const cursor = this.store.openCursor();
      return cursor as never;
    }
    return null as never;
  }

  // --- Create & Update

  async create(
    params: MongoCreateInput<Model>,
  ): Promise<MongoCreateOutput<Model>> {
    await this.store.add(params as never);
    return params as never;
  }

  async createMany(
    params: MongoCreateManyInput<Model>,
  ): Promise<MongoCreateManyOutput<Model>> {
    const transaction = this.transaction;
    params.forEach((docI) => {
      ensureId(docI);
    });
    await Promise.all([
      ...params.map((docI) => transaction.store.add(docI)),
      transaction.done,
    ]);
    return params as never;
  }

  async update(
    params: MongoUpdateInput<Model>,
  ): Promise<MongoUpdateOutput<Model>> {
    if ('where' in params) {
      const doc = await this.find({ query: params.where });
      if (doc) {
        Object.assign(doc, params.update);
        await this.store.put(doc as never);
        // await this.store.delete(getId(doc) as never);
        // await this.store.add(doc as never);
      }
      return doc as never;
    }
    const doc = await this.find({ ref: getId(params.doc) });
    if (doc) {
      Object.assign(doc, params.doc);
      await this.store.put(doc as never);
      // await this.store.delete(getId(doc) as never);
      // await this.store.add(doc as never);
    }
    return doc as never;
  }

  async updateMany(
    params: MongoUpdateManyInput<Model>,
  ): Promise<MongoUpdateManyOutput> {
    if ('where' in params) {
      return this.model
        .updateMany(params.where, params.update, {
          ...params.options,
          new: true,
          upsert: true,
        })
        .exec() as never;
    }
    const docs = await bulkUpdate(this.model, params.docs, {
      keyFields: params.keyFields,
    });
    return docs as never;
  }

  async createOrUpdate(
    params: MongoCreateOrUpdateInput<Model>,
  ): Promise<MongoCreateOrUpdateOutput<Model>> {
    if (params.where) {
      const existing = await this.find({ query: params.where });
      if (existing) {
        return this.update({
          doc: {
            ...params.doc,
            _id: getId(existing),
          },
        });
      } else {
        return this.create(fragmentExcept(params.doc, '_id') as never);
      }
    }

    if (getId(params.doc)) {
      return this.update({
        doc: params.doc,
      });
    }

    return this.create(params.doc as never);
  }

  async createOrUpdateMany(
    params: MongoCreateOrUpdateManyInput<Model>,
  ): Promise<MongoCreateOrUpdateManyOutput<Model>> {
    const bulk = this.model.collection.initializeUnorderedBulkOp();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wheres: any[] = [];
    params.docs.forEach((inputI) => {
      if ('where' in inputI) {
        wheres.push(inputI.where);
        bulk.find(inputI.where).upsert().updateOne({ $set: inputI.doc });
      } else {
        wheres.push({
          _id: getId(inputI),
        });
        bulk
          .find({
            _id: getId(inputI),
          })
          .upsert()
          .updateOne({ $set: inputI });
      }
    });
    if (!params.options?.returnDocs) {
      return [];
    }
    await bulk.execute();
    return this.findMany({
      query: {
        $or: wheres,
      },
    });
  }

  // --- Delete

  async delete(params: MongoDeleteInput<Model>): Promise<MongoDeleteOutput> {
    if ('where' in params) {
      const matches = await this.findMany({ query: params.where });
      await Promise.all(
        matches.map((matchI) => this.store.delete(getId(matchI) as never)),
      );
    }
    if ('ref' in params) {
      await this.store.delete(params.ref as never);
    }
    if ('refs' in params) {
      const ids = getIds(params.refs);
      await Promise.all(ids.map((id) => this.store.delete(id as never)));
    }
  }
}
