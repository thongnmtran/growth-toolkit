/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExtractHandlerParams } from '../../index';
import { BasicSubExecutionPipeline } from '../basic-pipeline/BasicSubExecutionPipeline';
import { CommonResultTypes } from './context/CommonExecutionResult';
import { CommonContextExtractor } from './common/CommonContextExtractor';
import { CommonExecutionHandler } from './CommonExecutionHandler';
import { CommonExecutionPipeline } from './CommonExecutionPipeline';

export class CommonSubExecutionPipeline<
  HandlerType extends CommonExecutionHandler,
  PipelineType extends CommonExecutionPipeline<any>
> extends BasicSubExecutionPipeline<HandlerType, PipelineType> {
  protected override errorHandler(error: unknown) {
    this.context.results.push({
      type: CommonResultTypes.ERROR,
      value: error as Error,
    });
  }

  protected override handlerParamsProvider(): ExtractHandlerParams<HandlerType> {
    const params = super.handlerParamsProvider();
    return {
      ...params,
      ctxe: new CommonContextExtractor(this.context),
    };
  }
}
