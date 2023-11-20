/* eslint-disable @typescript-eslint/no-explicit-any */
import { AutoIncrementPluginDef } from '../plugins';
import { autoIncreaseOrder } from './autoIncreaseOrder';

export function increaseOrderByOwner(): AutoIncrementPluginDef<any> {
  return autoIncreaseOrder('owner');
}
