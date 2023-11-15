/* eslint-disable @typescript-eslint/no-explicit-any */

import { ExtractType, Typed } from '../typed';

export type Listener<EventType = any> = (event: EventType) => unknown;

export type StandardEvent<Type, EventProps = object> = Typed<Type> &
  Omit<EventProps, 'type'>;

export type StandardListener<
  Events extends Typed,
  EventType extends Events['type']
> = Listener<ExtractType<Events, EventType>>;

export type ExtractEventProps<
  Events extends Typed,
  EventType extends Events['type']
> = Omit<ExtractType<Events, EventType>, 'type'>;
