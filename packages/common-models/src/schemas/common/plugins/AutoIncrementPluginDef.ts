import { AsString } from '@pandoraboz/common-utils';
import { ModelNames } from '../../../common';
import { DBPluginDef } from './common/DBPluginDef';

export type AutoIncrementPluginDef<Model> = DBPluginDef<
  'AutoIncrement',
  {
    model?: ModelNames;
    id?: string; // Default: `${this.model}_order`. `id` sẽ override `model`.
    inc_field?: AsString<keyof Model>; // Default: "order"
    reference_fields?: AsString<keyof Model>[]; // Default: undefined
  }
>;
