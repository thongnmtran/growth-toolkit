/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnyFunction } from '@pandoraboz/common-utils';
import { AnyDBPluginDef } from './DBPluginDef';
import { ModelDefinition } from '../../../base';

export type DBPlugin<PluginDefType extends AnyDBPluginDef> = {
  key: PluginDefType['key'];
  defaultSettings?: Partial<PluginDefType['settings']>;
  settingsResolver?: (
    settings: Partial<PluginDefType['settings']>,
    modelDef: ModelDefinition
  ) => Partial<PluginDefType['settings']>;
  func: AnyFunction;
};
export type AnyDBPlugin = DBPlugin<any>;
