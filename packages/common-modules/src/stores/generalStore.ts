import { ModelMap, ModelNames } from '@growth-toolkit/common-models';
import { ModuleStore } from '@growth-toolkit/common-utils';
import { NewMongoStore } from './NewMongoStore';
import { NewMongoStoreClient } from './NewMongoStoreClient';

export type ClientStoreMap = {
  [ModelName in ModelNames]: () => NewMongoStoreClient<ModelMap[ModelName]>;
};

export type ServerStoreMap = {
  [ModelName in ModelNames]: () => NewMongoStore<ModelMap[ModelName]>;
};

export const generalStore = new ModuleStore<GeneralStoreMap>();

export const loadStores = generalStore.loadModuleMap;

export const getStore = <ModelName extends ModelNames>(
  model: ModelName,
): ReturnType<GeneralStoreMap[ModelName]> => {
  return generalStore.getModule(
    model,
    ...([] as Parameters<GeneralStoreMap[ModelName]>),
  );
};
