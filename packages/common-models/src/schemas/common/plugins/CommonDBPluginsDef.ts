/* eslint-disable @typescript-eslint/no-explicit-any */
import { AutoIncrementPluginDef } from './AutoIncrementPluginDef';
import { PassportLocalPluginDef } from './PassportLocalPluginDef';

export type CommonDBPluginsDef<Model> =
  | AutoIncrementPluginDef<Model>
  | PassportLocalPluginDef<Model>;

export type AnyCommonDBPluginsDef = CommonDBPluginsDef<any>;
