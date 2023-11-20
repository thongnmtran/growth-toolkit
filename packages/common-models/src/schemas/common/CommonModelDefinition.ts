/* eslint-disable @typescript-eslint/no-explicit-any */
import { ModelMap, ModelNames } from '../../common';
import { ModelDefinition } from '../base';
import { CommonDBPluginsDef } from './plugins/CommonDBPluginsDef';

export type CommonModelDefinition<ModelName extends ModelNames> =
  ModelDefinition<ModelName, CommonDBPluginsDef<ModelMap[ModelName]>>;

export type AnyCommonModelDefinition = CommonModelDefinition<any>;
