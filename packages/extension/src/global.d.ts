import { NewDoc } from '@growth-toolkit/common-models';
import { ClientStoreMap } from '@growth-toolkit/common-modules';

declare global {
  declare type GeneralStoreMap = ClientStoreMap;
  declare type Doc<Model> = NewDoc<Model>;
}

/// <reference types="@samrum/vite-plugin-web-extension/client" />
