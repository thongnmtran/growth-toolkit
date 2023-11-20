import { SchemaDefinition, SchemaDefinitionType } from 'mongoose';

export type ModelSchema<ModelType> = SchemaDefinition<
  SchemaDefinitionType<ModelType>
>;
