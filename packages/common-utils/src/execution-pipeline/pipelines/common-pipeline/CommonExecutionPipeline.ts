/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnyExecutionHandler, ExtractContextType } from '../../base';
import { checkAndThrowError, findMainResult } from './common';
import {
  BasicExecutionPipeline,
  BasicExecutionPipelineRunParams,
} from '../basic-pipeline/BasicExecutionPipeline';
import { CommonExecutionHandler } from './CommonExecutionHandler';
import { CommonSubExecutionPipeline, ExtractMainResult } from '../index';

export class CommonExecutionPipeline<
  HandlerType extends CommonExecutionHandler
> extends BasicExecutionPipeline<HandlerType> {
  override subPipelineProvider<
    HandlerType extends CommonExecutionHandler<any>
  >({
    context,
    prevContext,
    handlers,
  }: {
    context: ExtractContextType<HandlerType>;
    prevContext: ExtractContextType<HandlerType>;
    handlers: HandlerType[];
  }): CommonSubExecutionPipeline<HandlerType, any> {
    return new CommonSubExecutionPipeline<HandlerType, any>(
      this as never,
      context,
      prevContext,
      handlers
    );
  }

  async runWithCheck<AdditionalHandlers extends AnyExecutionHandler = never>(
    runParams?: BasicExecutionPipelineRunParams<
      HandlerType | AdditionalHandlers
    >
  ): Promise<ExtractContextType<HandlerType | AdditionalHandlers>> {
    const context = await this.run(runParams);
    checkAndThrowError(context);
    return context;
  }

  async runAndReturnMainResult<
    AdditionalHandlers extends AnyExecutionHandler = never
  >(
    runParams?: BasicExecutionPipelineRunParams<
      HandlerType | AdditionalHandlers
    >
  ): Promise<
    | ExtractMainResult<ExtractContextType<HandlerType | AdditionalHandlers>>
    | undefined
  > {
    const context = await this.runWithCheck(runParams);
    return findMainResult(context);
  }
}
