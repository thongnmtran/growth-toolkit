import { ModelNames } from '@growth-toolkit/common-models';
import { loadStores } from '@growth-toolkit/common-modules';
import { NewIDBStore } from './NewIDBStore';

export const clientStoreMap: GeneralStoreMap = {} as never;

Object.values(ModelNames).forEach((modelName) => {
  clientStoreMap[modelName as never] = (() =>
    new NewIDBStore(modelName)) as never;
});

export function loadClientStores() {
  loadStores(clientStoreMap);
}
