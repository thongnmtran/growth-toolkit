import { Collection, Model } from 'mongoose';

export type BulkWriteResult = ReturnType<
  ReturnType<typeof Collection['initializeUnorderedBulkOp']>['execute']
>;

export type UpdateManyResult = ReturnType<
  ReturnType<typeof Model['updateMany']>['exec']
>;
