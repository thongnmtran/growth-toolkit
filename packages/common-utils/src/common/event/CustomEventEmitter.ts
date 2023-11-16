/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter } from 'events';
import { ExtractType, Typed } from '../../typed';
import { AnyFunction, Listener } from '../../types';

export type ExtractEvent<
  EventType extends Events['type'] | '*',
  Events extends Typed,
> = ExtractType<Events, EventType extends '*' ? Events['type'] : EventType>;

export type PickListener<
  EventType extends Events['type'] | '*',
  Events extends Typed,
> = Listener<ExtractEvent<EventType, Events>>;

export type EventHook<
  EventType extends Events['type'] | '*' = any,
  Events extends Typed = any,
> = (event: ExtractEvent<EventType, Events>) => ExtractEvent<EventType, Events>;

export class CustomEventEmitter<Events extends Typed = any> {
  #emitter = new EventEmitter();
  #pipeMap = new Map<EventEmitter, Listener>();
  #hookMap: Partial<Record<Events['type'] | '*', EventHook[]>> = {};

  #callEmitter<MethodType extends AnyFunction>(
    func: MethodType,
    ...params: Parameters<MethodType>
  ) {
    func.call(this.#emitter, ...params);
  }

  setMaxListeners(maxNumListener: number): this {
    return this.#emitter.setMaxListeners(maxNumListener) as never;
  }

  getMaxListeners(): number {
    return this.#emitter.getMaxListeners();
  }

  eventNames(): Array<Events['type']> {
    return this.#emitter.eventNames() as never;
  }

  emit<EventType extends Events['type']>(
    type: EventType,
    event: ExtractType<Events, EventType>,
  ): boolean {
    const hooks = this.getHooks(type);
    const finalEvent = hooks.reduce((finalEvent, hookI) => {
      return hookI(finalEvent as never) as never;
    }, event);
    this.#emitter.emit('*', finalEvent) as never;
    return this.#emitter.emit(type, finalEvent) as never;
  }

  emitEvent(event: Events): boolean {
    return this.emit(event.type, event as never);
  }

  addListener<EventType extends Events['type'] | '*'>(
    type: EventType,
    listener: PickListener<EventType, Events>,
  ): this {
    this.on(type, listener);
    return this;
  }

  on<EventType extends Events['type'] | '*'>(
    type: EventType,
    listener: PickListener<EventType, Events>,
  ): this {
    this.#callEmitter(this.#emitter.on, type, listener);
    return this;
  }

  once<EventType extends Events['type'] | '*'>(
    type: EventType,
    listener: PickListener<EventType, Events>,
  ): this {
    this.#callEmitter(this.#emitter.once, type, listener);
    return this;
  }

  prependListener<EventType extends Events['type'] | '*'>(
    type: EventType,
    listener: PickListener<EventType, Events>,
  ): this {
    this.#callEmitter(this.#emitter.prependListener, type, listener);
    return this;
  }

  prependOnceListener<EventType extends Events['type'] | '*'>(
    type: EventType,
    listener: PickListener<EventType, Events>,
  ): this {
    this.#callEmitter(this.#emitter.prependOnceListener, type, listener);
    return this;
  }

  removeListener<EventType extends Events['type'] | '*'>(
    type: EventType,
    listener: PickListener<EventType, Events>,
  ): this {
    this.off(type, listener);
    return this;
  }

  off<EventType extends Events['type'] | '*'>(
    type: EventType,
    listener: PickListener<EventType, Events>,
  ): this {
    this.#callEmitter(this.#emitter.off, type, listener);
    return this;
  }

  removeAllListeners<EventType extends Events['type'] | '*'>(
    type?: EventType,
  ): this {
    this.#emitter.removeAllListeners(type === '*' ? undefined : type);
    return this;
  }

  listeners<EventType extends Events['type']>(
    type: EventType,
  ): Listener<ExtractType<Events, EventType>>[] {
    return this.#emitter.listeners(type) as never;
  }

  listenerCount<EventType extends Events['type']>(type: EventType): number {
    return this.#emitter.listenerCount(type) as never;
  }

  rawListeners<EventType extends Events['type']>(
    type: EventType,
  ): Listener<ExtractType<Events, EventType>>[] {
    return this.#emitter.rawListeners(type) as never;
  }

  pipe(destEmitter: EventEmitter): this {
    this.unpipe(destEmitter);
    const listener: Listener<ExtractType<Events, Events['type']>> = (event) => {
      destEmitter.emit(event.type, event);
    };
    this.#pipeMap.set(destEmitter, listener);
    this.on('*', listener);
    return this;
  }

  unpipe(destEmitter: EventEmitter): this {
    const existingListener = this.#pipeMap.get(destEmitter);
    if (existingListener) {
      this.off('*', existingListener);
    }
    return this;
  }

  hook<EventType extends Events['type'] | '*'>(
    type: EventType,
    hook: EventHook<EventType, Events>,
  ): this {
    this.unhook(type, hook);
    const hooks = this.getHooks(type);
    hooks.push(hook);
    return this;
  }

  unhook<EventType extends Events['type'] | '*'>(
    type: EventType,
    hook: EventHook<EventType, Events>,
  ): this {
    const hooks = this.getHooks(type);
    const hookIndex = hooks.indexOf(hook);
    if (hookIndex > 0) {
      hooks.splice(hookIndex, 1);
    }
    return this;
  }

  getHooks<EventType extends Events['type'] | '*'>(
    type: EventType,
  ): EventHook<EventType, Events>[] {
    if (!this.#hookMap[type]) {
      this.#hookMap[type] = [];
    }
    const allHooks = this.#hookMap['*'] ?? [];
    const hooks = this.#hookMap[type] as EventHook<EventType, Events>[];
    return [...new Set([...allHooks, ...hooks])];
  }
}
