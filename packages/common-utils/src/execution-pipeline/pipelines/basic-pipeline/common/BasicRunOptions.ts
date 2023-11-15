import {
  AnyExecutionContext,
  ExtractParamsType,
  ExtractResultsType,
} from "../../../base";

export type BasicRunOptions<ContextType extends AnyExecutionContext> = {
  persistentParams?: ExtractParamsType<ContextType>["type"][];
  persistentResults?: ExtractResultsType<ContextType>["type"][];
};
