import {
  AnyExecutionContext,
  ExtractParamsType,
} from "../base/context/ExecutionContext";

export function generateExecutionContext<
  ContextType extends AnyExecutionContext
>(params: ExtractParamsType<ContextType>[] = []): ContextType {
  return {
    params,
    results: [],
  } as never;
}
