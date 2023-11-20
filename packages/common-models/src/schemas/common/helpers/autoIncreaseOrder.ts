import { Unpacked } from '@pandoraboz/common-utils';
import { AutoIncrementPluginDef } from '../plugins';

export function autoIncreaseOrder<Model>(
  ...referenceFields: NonNullable<
    Unpacked<AutoIncrementPluginDef<Model>['settings']['reference_fields']>
  >[]
): AutoIncrementPluginDef<Model> {
  return {
    key: 'AutoIncrement',
    settings: {
      reference_fields: referenceFields,
    },
  };
}
