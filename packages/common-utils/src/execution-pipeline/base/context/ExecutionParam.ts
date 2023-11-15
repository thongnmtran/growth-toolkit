/* eslint-disable @typescript-eslint/no-explicit-any */
import { TypedValue } from "../../../typed";

export type ExecutionParam<ParamType = any, ParamValueType = any> = TypedValue<
  ParamValueType,
  ParamType
>;
