/* eslint-disable @typescript-eslint/no-explicit-any */

import { AnyKey } from '@pandoraboz/common-utils';

export type DBPluginDef<KeyType extends AnyKey, SettingsType> = {
  key: KeyType;
  settings: SettingsType;
};

export type AnyDBPluginDef = DBPluginDef<AnyKey, any>;
