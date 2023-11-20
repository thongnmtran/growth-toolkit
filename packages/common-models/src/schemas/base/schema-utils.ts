/* eslint-disable @typescript-eslint/no-explicit-any */
import { ValueOf } from '@pandoraboz/common-utils';
import { Schema, SchemaDefinitionProperty } from 'mongoose';
import { ModelMap, ModelNames } from '../../common';

export const ObjectId = Schema.Types.ObjectId;

export function Enum<Type>(
  ValueSet: any,
  defaultValue?: ValueOf<Type> | null,
  options?: SchemaDefinitionProperty<Type>
): SchemaDefinitionProperty<Type> {
  let values: ValueOf<Type>[] = [];
  if (ValueSet) {
    values = Array.isArray(ValueSet) ? ValueSet : Object.values(ValueSet);
  }
  return {
    type: values?.[0]?.constructor,
    enum: [...new Set([...values, null])],
    default: defaultValue,
    ...(options as any),
  };
}

export function modelRefIndex<ModelName extends ModelNames>(model: ModelName) {
  return modelRef(model, { index: true });
}

export function modelRef<ModelName extends ModelNames>(
  model: ModelName,
  options?: SchemaDefinitionProperty<ModelMap[ModelName]>
) {
  const schema = { ref: model, type: ObjectId };
  if (typeof options === 'object') {
    Object.assign(schema, options);
  }
  return schema;
}
