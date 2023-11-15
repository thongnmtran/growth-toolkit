/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter } from 'events';
import { ExtractType, Typed } from '../../typed';
import { Listener } from '../../types';

/**
 * Hỗ trợ Event dạng { type: '...' }
 */
export interface StrictEventEmitter<EventTypes extends Typed = any>
  extends EventEmitter {
  eventNames(): Array<EventTypes['type']>;

  emit<EventType extends EventTypes['type']>(
    type: EventType,
    event: ExtractType<EventTypes, EventType>
  ): boolean;

  addListener<EventType extends EventTypes['type']>(
    type: EventType,
    listener: Listener<ExtractType<EventTypes, EventType>>
  ): this;

  on<EventType extends EventTypes['type']>(
    type: EventType,
    listener: Listener<ExtractType<EventTypes, EventType>>
  ): this;

  once<EventType extends EventTypes['type']>(
    type: EventType,
    listener: Listener<ExtractType<EventTypes, EventType>>
  ): this;

  prependListener<EventType extends EventTypes['type']>(
    type: EventType,
    listener: Listener<ExtractType<EventTypes, EventType>>
  ): this;

  prependOnceListener<EventType extends EventTypes['type']>(
    type: EventType,
    listener: Listener<ExtractType<EventTypes, EventType>>
  ): this;

  removeListener<EventType extends EventTypes['type']>(
    type: EventType,
    listener: Listener<ExtractType<EventTypes, EventType>>
  ): this;

  off<EventType extends EventTypes['type']>(
    type: EventType,
    listener: Listener<ExtractType<EventTypes, EventType>>
  ): this;

  removeAllListeners<EventType extends EventTypes['type']>(
    type?: EventType
  ): this;

  listeners<EventType extends EventTypes['type']>(
    type: EventType
  ): Listener<ExtractType<EventTypes, EventType>>[];

  listenerCount<EventType extends EventTypes['type']>(type: EventType): number;

  rawListeners<EventType extends EventTypes['type']>(
    type: EventType
  ): Listener<ExtractType<EventTypes, EventType>>[];
}

export function createStrictEventEmitter<
  EventType extends Typed = any
>(): StrictEventEmitter<EventType> {
  return new EventEmitter() as never;
}

export function asStrictEventEmitter<EventType extends Typed = any>(
  eventEmitter: EventEmitter
): StrictEventEmitter<EventType> {
  return eventEmitter as never;
}
