/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AnyExecutionHandler,
  ExecutionPipeline,
  ExecutionPipelineRunParams,
  ExtractContextType,
} from '../../base';
import { BaseBasicExecutionPipeline } from './BaseBasicExecutionPipeline';
import { BasicSubExecutionPipeline } from './BasicSubExecutionPipeline';
import { generateExecutionContext } from '../../common/generateExecutionContext';
import { keepPersistentContext } from './common/keepPersistentContext';
import { BasicRunOptions } from './common/BasicRunOptions';
import { BasicExecutionHandler } from './BasicExecutionHandler';

export type BasicExecutionPipelineRunParams<
  HandlerType extends AnyExecutionHandler
> = ExecutionPipelineRunParams<
  HandlerType,
  BasicRunOptions<ExtractContextType<HandlerType>>
>;

export class BasicExecutionPipeline<HandlerType extends AnyExecutionHandler>
  extends BaseBasicExecutionPipeline<HandlerType>
  implements ExecutionPipeline<HandlerType>
{
  prevContext: ExtractContextType<HandlerType> = generateExecutionContext();

  subPipelineProvider<HandlerType extends BasicExecutionHandler<any>>({
    context,
    prevContext,
    handlers,
  }: {
    context: ExtractContextType<HandlerType>;
    prevContext: ExtractContextType<HandlerType>;
    handlers: HandlerType[];
  }): BasicSubExecutionPipeline<any, any> {
    return new BasicSubExecutionPipeline<HandlerType, any>(
      this,
      context,
      prevContext,
      handlers
    );
  }

  schedule<AdditionalHandlers extends AnyExecutionHandler = never>(
    runParams?: BasicExecutionPipelineRunParams<
      HandlerType | AdditionalHandlers
    >
  ): BasicSubExecutionPipeline<
    HandlerType | AdditionalHandlers,
    BasicExecutionPipeline<HandlerType | AdditionalHandlers>
  > {
    const { handlers } = runParams || {};
    const allHandlers = [...this.handlers, ...(handlers || [])];

    const { params } = runParams || {};
    const context = generateExecutionContext<
      ExtractContextType<HandlerType> | ExtractContextType<AdditionalHandlers>
    >(params);

    // Copy persistent params/results from `this.prevContext` to `subPipeline.context`
    keepPersistentContext(context, this.prevContext, runParams?.options);

    const subPipeline = this.subPipelineProvider({
      context,
      prevContext: this.prevContext,
      handlers: allHandlers,
    });

    subPipeline.pipeline = this;

    return subPipeline;
  }

  async run<AdditionalHandlers extends AnyExecutionHandler = never>(
    runParams?: BasicExecutionPipelineRunParams<
      HandlerType | AdditionalHandlers
    >
  ): Promise<ExtractContextType<HandlerType | AdditionalHandlers>> {
    const subPipeline = this.schedule<AdditionalHandlers>(runParams);

    await subPipeline.run();

    this.prevContext = subPipeline.context;

    return subPipeline.context;
  }
}
