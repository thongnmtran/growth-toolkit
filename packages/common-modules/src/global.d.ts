import type { HydratedDocument } from 'mongoose';
import type { ServerStoreMap } from './stores/generalStore';

export {};

declare global {
  declare type GeneralStoreMap = ServerStoreMap;

  declare type Doc<Model> = HydratedDocument<Model>;
}
