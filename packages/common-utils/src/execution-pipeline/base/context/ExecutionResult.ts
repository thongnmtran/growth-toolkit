/* eslint-disable @typescript-eslint/no-explicit-any */
import { TypedValue } from "../../../typed";

export type ExecutionResult<
  ResultType = any,
  ResultValueType = any
> = TypedValue<ResultValueType, ResultType>;
