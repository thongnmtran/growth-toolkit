import type { ServerStoreMap } from './stores/generalStore';
import type { NewDoc } from './base';

export {};

declare global {
  declare type GeneralStoreMap = ServerStoreMap;

  declare type Doc<Model> = NewDoc<Model>;
}
