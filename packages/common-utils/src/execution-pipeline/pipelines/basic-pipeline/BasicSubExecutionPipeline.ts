/* eslint-disable @typescript-eslint/no-explicit-any */
import { createStrictEventEmitter, removeItems } from '../../../common';
import {
  AnyFunction,
  ExtractEventProps,
  StandardListener,
} from '../../../types';
import {
  ExtractContextType,
  ExtractHandlerParams,
  SubExecutionPipeline,
} from '../../base';
import { BaseBasicExecutionPipeline } from './BaseBasicExecutionPipeline';
import { BasicExecutionHandler } from './BasicExecutionHandler';
import { BasicContextExtractor } from './common';
import {
  BasicPipelineEvent,
  BasicPipelineEventKey,
} from './common/BasicPipelineEvent';
import { runHandler } from './common/runHandler';

export class BasicSubExecutionPipeline<
    HandlerType extends BasicExecutionHandler<any>,
    PipelineType
  >
  extends BaseBasicExecutionPipeline<HandlerType>
  implements SubExecutionPipeline<HandlerType>
{
  rerunRequested = false;
  rerunHandlerRequested = false;
  skipRequested = false;
  abortController = new AbortController();
  cleanUpHandlers: AnyFunction[] = [];
  emitter = createStrictEventEmitter<BasicPipelineEvent<HandlerType>>();

  /**
   * Total times we run this sub-pipeline (Count all the retries).
   */
  times = 0;

  get isFirstTime() {
    return this.times === 1;
  }

  constructor(
    public pipeline: PipelineType,
    public context: ExtractContextType<HandlerType>,
    public prevContext: ExtractContextType<HandlerType>,
    handlers: HandlerType[]
  ) {
    super(handlers);
    this.run = this.run.bind(this);
  }

  protected errorHandler(error: unknown) {
    console.warn(error);
  }

  protected handlerParamsProvider(): ExtractHandlerParams<HandlerType> {
    const params: ExtractHandlerParams<HandlerType> = {
      context: this.context,
      prevContext: this.context,
      subPipeline: this,
      pipeLine: this.pipeline,
      ctxe: new BasicContextExtractor(this.context),
    } as never;
    return params;
  }

  reset() {
    this.rerunRequested = false;
    this.rerunHandlerRequested = false;
    this.skipRequested = false;
    this.abortController = new AbortController();
    // this.times = 0; // Do not reset times value
  }

  requestRerun() {
    this.rerunRequested = true;
  }

  requestRerunHandler() {
    this.rerunHandlerRequested = true;
  }

  requestSkip() {
    this.skipRequested = true;
  }

  abort() {
    this.requestSkip();
    this.abortController.abort();
    this.emit(BasicPipelineEventKey.ABORTED);
  }

  async run(): Promise<ExtractContextType<HandlerType>> {
    const { context, handlers } = this;
    this.emit(BasicPipelineEventKey.STARTED);

    do {
      this.reset();
      this.times++;

      this.emit(BasicPipelineEventKey.ROUND_STARTED);

      // Keep running if an error occur, Only rerun the sub-pipeline if the "rerunRequested" is set to "true"
      handlerLoop: for (const handler of handlers) {
        do {
          this.emit(BasicPipelineEventKey.HANDLER_STARTED, { handler });

          this.rerunHandlerRequested = false;
          try {
            const params = this.handlerParamsProvider();
            await runHandler(handler, params);
          } catch (error) {
            this.errorHandler(error);
          }
          if (this.rerunRequested || this.skipRequested) {
            break handlerLoop;
          }

          this.emit(BasicPipelineEventKey.HANDLER_ENDED, {
            handler,
          });
        } while (this.rerunHandlerRequested);
      }

      this.emit(BasicPipelineEventKey.ROUND_ENDED);
    } while (this.rerunRequested);

    this.emit(BasicPipelineEventKey.CLEAN_UP);

    await Promise.allSettled(
      this.cleanUpHandlers.map((handlerI) => handlerI())
    );

    this.emit(BasicPipelineEventKey.ENDED);
    return context;
  }

  onCleanUp(handler: AnyFunction) {
    this.cleanUpHandlers.push(handler);
  }

  offCleanUp(handler: AnyFunction) {
    removeItems(this.cleanUpHandlers, [handler]);
  }

  addListener<EventType extends BasicPipelineEvent['type']>(
    event: EventType,
    listener: StandardListener<BasicPipelineEvent, EventType>
  ) {
    this.emitter.addListener(event, listener);
  }

  removeListener<EventType extends BasicPipelineEvent['type']>(
    event: EventType,
    listener: StandardListener<BasicPipelineEvent, EventType>
  ) {
    this.emitter.removeListener(event, listener);
  }

  emit<EventType extends BasicPipelineEvent['type']>(
    event: EventType,
    props?: ExtractEventProps<BasicPipelineEvent, EventType>
  ) {
    this.emitter.emit(event, {
      type: event,
      ...props,
    } as never);
  }
}
