import { StandardEvent } from '../../../../types';
import { AnyExecutionHandler } from '../../../base';

export enum BasicPipelineEventKey {
  STARTED = 'started',
  ENDED = 'ended',
  ROUND_STARTED = 'round_started',
  ROUND_ENDED = 'round_ended',
  HANDLER_STARTED = 'handler_started',
  HANDLER_ENDED = 'handler_ended',
  CLEAN_UP = 'clean_up',
  ABORTED = 'aborted',
}

export type PipelineStartedEvent = StandardEvent<BasicPipelineEventKey.STARTED>;

export type PipelineEndedEvent = StandardEvent<BasicPipelineEventKey.ENDED>;

export type PipelineRoundStartedEvent =
  StandardEvent<BasicPipelineEventKey.ROUND_STARTED>;

export type PipelineRoundEndedEvent =
  StandardEvent<BasicPipelineEventKey.ROUND_ENDED>;

export type PipelineHandlerStartedEvent<
  HandlerType extends AnyExecutionHandler = AnyExecutionHandler
> = StandardEvent<
  BasicPipelineEventKey.HANDLER_STARTED,
  {
    handler: HandlerType;
  }
>;

export type PipelineHandlerEndedEvent<
  HandlerType extends AnyExecutionHandler = AnyExecutionHandler
> = StandardEvent<
  BasicPipelineEventKey.HANDLER_ENDED,
  {
    handler: HandlerType;
  }
>;

export type PipelineCleanUpEvent =
  StandardEvent<BasicPipelineEventKey.CLEAN_UP>;

export type PipelineAbortedEvent = StandardEvent<BasicPipelineEventKey.ABORTED>;

export type BasicPipelineEvent<
  HandlerType extends AnyExecutionHandler = AnyExecutionHandler
> =
  | PipelineStartedEvent
  | PipelineEndedEvent
  | PipelineRoundStartedEvent
  | PipelineRoundEndedEvent
  | PipelineHandlerStartedEvent<HandlerType>
  | PipelineHandlerEndedEvent<HandlerType>
  | PipelineCleanUpEvent
  | PipelineAbortedEvent;
