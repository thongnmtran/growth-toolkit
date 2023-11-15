import { EventEmitter } from 'events';
import { AnyKey, Listener } from '../../types';

/**
 * Hỗ trợ bất kỳ dạng event nào (k chỉ { type: '...' } như StrictEventEmitter)
 */
export interface FlexEventEmitter<EventMap extends Record<AnyKey, unknown>>
  extends EventEmitter {
  eventNames(): Array<string>;

  emit<EventType extends keyof EventMap>(
    type: EventType,
    event: EventMap[EventType]
  ): boolean;

  addListener<EventType extends keyof EventMap>(
    type: EventType,
    listener: Listener<EventMap[EventType]>
  ): this;

  on<EventType extends keyof EventMap>(
    type: EventType,
    listener: Listener<EventMap[EventType]>
  ): this;

  once<EventType extends keyof EventMap>(
    type: EventType,
    listener: Listener<EventMap[EventType]>
  ): this;

  prependListener<EventType extends keyof EventMap>(
    type: EventType,
    listener: Listener<EventMap[EventType]>
  ): this;

  prependOnceListener<EventType extends keyof EventMap>(
    type: EventType,
    listener: Listener<EventMap[EventType]>
  ): this;

  removeListener<EventType extends keyof EventMap>(
    type: EventType,
    listener: Listener<EventMap[EventType]>
  ): this;

  off<EventType extends keyof EventMap>(
    type: EventType,
    listener: Listener<EventMap[EventType]>
  ): this;

  removeAllListeners<EventType extends keyof EventMap>(type?: EventType): this;

  listeners<EventType extends keyof EventMap>(
    type: EventType
  ): Listener<EventMap[EventType]>[];

  listenerCount<EventType extends keyof EventMap>(type: EventType): number;

  rawListeners<EventType extends keyof EventMap>(
    type: EventType
  ): Listener<EventMap[EventType]>[];
}

export function createFlexEventEmitter<
  EventMap extends Record<string | number, unknown>
>(): FlexEventEmitter<EventMap> {
  return new EventEmitter() as never;
}

export function asFlexEventEmitter<
  EventMap extends Record<string | number, unknown>
>(eventEmitter: EventEmitter): FlexEventEmitter<EventMap> {
  return eventEmitter as never;
}
