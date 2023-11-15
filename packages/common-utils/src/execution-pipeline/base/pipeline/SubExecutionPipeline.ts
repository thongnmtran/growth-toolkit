/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AnyExecutionHandler,
  ExtractContextType,
} from '../handler/ExecutionHandler';
import { BaseExecutionPipeline } from './BaseExecutionPipeline';

export interface SubExecutionPipeline<HandlerType extends AnyExecutionHandler>
  extends BaseExecutionPipeline<HandlerType> {
  times: number;
  context: ExtractContextType<HandlerType>;

  reset(): void;

  requestRerun(): void;

  requestRerunHandler(): void;

  requestSkip(): void;

  run(): Promise<ExtractContextType<HandlerType>>;
}
