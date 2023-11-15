/* eslint-disable @typescript-eslint/no-explicit-any */
import { BasicExecutionPipelineRunParams } from '../basic-pipeline/BasicExecutionPipeline';
import { CommonExecutionHandler } from '../common-pipeline/CommonExecutionHandler';
import { CommonExecutionPipeline } from '../common-pipeline/CommonExecutionPipeline';
import { CommonSubExecutionPipeline } from '../common-pipeline/CommonSubExecutionPipeline';

export class MultiStagesExecutionPipeline<
  HandlerType extends CommonExecutionHandler
> extends CommonExecutionPipeline<HandlerType> {
  beforePreHandlers: HandlerType[] = [];
  preHandlers: HandlerType[] = [];
  afterPreHandlers: HandlerType[] = [];

  beforeMainHandlers: HandlerType[] = [];
  mainHandlers: HandlerType[] = [];
  afterMainHandlers: HandlerType[] = [];

  beforePostHandlers: HandlerType[] = [];
  postHandlers: HandlerType[] = [];
  afterPostHandlers: HandlerType[] = [];

  // --- Pre Handlers
  registerBeforePreHandler(...handlers: HandlerType[]) {
    this.beforePreHandlers.push(...handlers);
  }
  registerPreHandler(...handlers: HandlerType[]) {
    this.preHandlers.push(...handlers);
  }
  registerAfterPreHandler(...handlers: HandlerType[]) {
    this.afterPreHandlers.push(...handlers);
  }

  // --- Main Handlers
  registerBeforeMainHandler(...handlers: HandlerType[]) {
    this.beforeMainHandlers.push(...handlers);
  }
  registerMainHandler(...handlers: HandlerType[]) {
    this.mainHandlers.push(...handlers);
  }
  registerAfterMainHandler(...handlers: HandlerType[]) {
    this.afterMainHandlers.push(...handlers);
  }

  // --- Post Handlers
  registerBeforePostHandler(...handlers: HandlerType[]) {
    this.beforePostHandlers.push(...handlers);
  }
  registerPostHandler(...handlers: HandlerType[]) {
    this.postHandlers.push(...handlers);
  }
  registerAfterPostHandler(...handlers: HandlerType[]) {
    this.afterPostHandlers.push(...handlers);
  }

  wrapHandlers<AdditionalHandlers extends CommonExecutionHandler<any>>(
    ...handlers: (AdditionalHandlers | HandlerType)[]
  ): (AdditionalHandlers | HandlerType)[] {
    return [
      ...this.beforePreHandlers,
      ...this.preHandlers,
      ...this.afterPreHandlers,
      ...this.beforeMainHandlers,
      ...this.mainHandlers,
      ...handlers,
      ...this.afterMainHandlers,
      ...this.beforePostHandlers,
      ...this.postHandlers,
      ...this.afterPostHandlers,
    ];
  }

  override schedule<
    AdditionalHandlers extends CommonExecutionHandler<any> = never
  >(
    runParams?: BasicExecutionPipelineRunParams<
      HandlerType | AdditionalHandlers
    >
  ): CommonSubExecutionPipeline<
    HandlerType | AdditionalHandlers,
    MultiStagesExecutionPipeline<HandlerType | AdditionalHandlers>
  > {
    if (!runParams) {
      runParams = {
        handlers: [],
        params: [],
      };
    }
    runParams.handlers = this.wrapHandlers<AdditionalHandlers>(
      ...(runParams.handlers || [])
    );
    return super.schedule(runParams) as never;
  }
}
