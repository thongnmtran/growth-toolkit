/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExecutionResult } from "../../../base";

export enum CommonResultTypes {
  ERROR = "Error",
  MAIN_RESULT = "MainResult",
}

export type ExecutionErrorResult = ExecutionResult<
  CommonResultTypes.ERROR,
  Error
>;

export type ExecutionMainResult<MainResultType = never> = ExecutionResult<
  CommonResultTypes.MAIN_RESULT,
  MainResultType
>;

export type CommonExecutionResult<MainResultType = never> =
  | ExecutionErrorResult
  | ExecutionMainResult<MainResultType>;
