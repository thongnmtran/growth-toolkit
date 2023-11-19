/* eslint-disable @typescript-eslint/no-explicit-any */

export type DataStoreAPIMap<
  CreateInput = any,
  CreateOutput = any,
  CreateManyInput = any,
  CreateManyOutput = any,
  UpdateInput = any,
  UpdateOutput = any,
  UpdateManyInput = any,
  UpdateManyOutput = any,
  CreateOrUpdateInput = any,
  CreateOrUpdateOutput = any,
  CreateOrUpdateManyInput = any,
  CreateOrUpdateManyOutput = any,
  FindInput = any,
  FindOutput = any,
  FindManyInput = any,
  FindManyOutput = any,
  CursorInput = any,
  CursorOutput = any,
  DeleteInput = any,
  DeleteOutput = any,
> = {
  CreateInput: CreateInput;
  CreateOutput: CreateOutput;
  CreateManyInput: CreateManyInput;
  CreateManyOutput: CreateManyOutput;
  UpdateInput: UpdateInput;
  UpdateOutput: UpdateOutput;
  UpdateManyInput: UpdateManyInput;
  UpdateManyOutput: UpdateManyOutput;
  CreateOrUpdateInput: CreateOrUpdateInput;
  CreateOrUpdateOutput: CreateOrUpdateOutput;
  CreateOrUpdateManyInput: CreateOrUpdateManyInput;
  CreateOrUpdateManyOutput: CreateOrUpdateManyOutput;
  FindInput: FindInput;
  FindOutput: FindOutput;
  FindManyInput: FindManyInput;
  FindManyOutput: FindManyOutput;
  CursorInput: CursorInput;
  CursorOutput: CursorOutput;
  DeleteInput: DeleteInput;
  DeleteOutput: DeleteOutput;
};

export interface NewDataStore<ApiMap extends DataStoreAPIMap> {
  // --- Create
  create(params: ApiMap['CreateInput']): Promise<ApiMap['CreateOutput']>;
  createMany(
    params: ApiMap['CreateManyInput'],
  ): Promise<ApiMap['CreateManyOutput']>;

  // --- Update
  update(params: ApiMap['UpdateInput']): Promise<ApiMap['UpdateOutput']>;
  updateMany(
    params: ApiMap['UpdateManyInput'],
  ): Promise<ApiMap['UpdateManyOutput']>;

  // --- Create or Update
  createOrUpdate<InputType extends ApiMap['CreateOrUpdateInput']>(
    params: InputType,
  ): Promise<ApiMap['CreateOrUpdateOutput']>;
  createOrUpdateMany<InputType extends ApiMap['CreateOrUpdateManyInput']>(
    params: InputType,
  ): Promise<ApiMap['CreateOrUpdateManyOutput']>;

  // --- Find
  find(params: ApiMap['FindInput']): Promise<ApiMap['FindOutput']>;
  findMany(params: ApiMap['FindManyInput']): Promise<ApiMap['FindManyOutput']>;
  cursor(params: ApiMap['CursorInput']): ApiMap['CursorOutput'];

  // --- Delete
  delete(params: ApiMap['DeleteInput']): Promise<ApiMap['DeleteOutput']>;
}
