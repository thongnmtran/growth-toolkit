import { getId, getIds, ModelNames } from '@growth-toolkit/common-models';
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

export class NewIDBStore<Model extends object> implements NewMongoStore<Model> {
  constructor(public modelName: ModelNames) {}

  get store() {
    return IDBManager.instance.db.transaction(this.modelName).store;
  }

  async find(params: MongoFindInput<Model>): Promise<MongoFindOutput<Model>> {
    if ('query' in params) {
      let cursor = await this.store.openCursor();

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
      const doc = await this.model
        .findById(params.ref, null, params.options)
        .select(params.options?.fields);
      return doc || undefined;
    }

    return;
  }

  async findMany(
    params: MongoFindManyInput<Model>,
  ): Promise<MongoFindManyOutput<Model>> {
    if ('query' in params) {
      const docs = await this.model
        .find(params.query, null, params.options)
        .select(params.options?.fields);
      return docs;
    }
    if ('refs' in params) {
      const ids = getIds(params.refs);
      const docs = await this.model
        .find({ _id: { $in: ids } }, null, params.options)
        .select(params.options?.fields);
      return docs;
    }
    return [];
  }

  cursor(params: MongoCursorInput<Model>): MongoCursorOutput<Model> {
    if ('query' in params) {
      const cursor = this.model
        .find(params.query, null, params.options)
        .select(params.options?.fields)
        .cursor();
      return cursor as never;
    }
    if ('refs' in params) {
      const ids = getIds(params.refs);
      const cursor = this.model
        .find({ _id: { $in: ids } }, null, params.options)
        .select(params.options?.fields)
        .cursor();
      return cursor as never;
    }
    return null as never;
  }

  // --- Create & Update

  async create(
    params: MongoCreateInput<Model>,
  ): Promise<MongoCreateOutput<Model>> {
    return this.model.create(params);
  }

  async createMany(
    params: MongoCreateManyInput<Model>,
  ): Promise<MongoCreateManyOutput<Model>> {
    return this.model.create(...params);
  }

  async update(
    params: MongoUpdateInput<Model>,
  ): Promise<MongoUpdateOutput<Model>> {
    if ('where' in params) {
      return this.model
        .findOneAndUpdate(params.where, params.update, {
          ...params.options,
          new: true,
        })
        .exec() as never;
    }
    return this.model
      .findByIdAndUpdate(
        getId(params.doc),
        fragmentExcept(params.doc, '_id' as never),
      )
      .exec() as never;
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
      await this.model.deleteMany(params.where);
    }
    if ('ref' in params) {
      await this.model.findByIdAndDelete(params.ref);
    }
    if ('refs' in params) {
      const ids = getIds(params.refs);
      await this.model.deleteMany({ _id: { $in: ids } });
    }
  }
}
