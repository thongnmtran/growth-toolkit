import { Moment } from 'moment';
import { Combination, Nullable } from '../../types';

type Day = `${number}d`;
type Hour = `${number}h`;
type Min = `${number}m`;
type Sec = `${number}s`;
type Mills = `${number}ms`;

export type TimeInputString = Combination<[Day, Hour, Min, Sec, Mills]>;

export type Duration = {
  days: number;
  hours: number;
  mins: number;
  secs: number;
};

export function isDuration(time: unknown): time is Duration {
  if (!time || typeof time !== 'object') {
    return false;
  }
  return 'days' in time && 'hours' in time && 'mins' in time && 'secs' in time;
}

export type AnyTimeInput = Nullable<
  string | number | Moment | TimeInputString | Duration
>;

export type AnyDurationInput = TimeInputString | Duration | number;

export enum CommonTimeFormat {
  TIME = 'HH:mm:ss',
  DATE = 'DD/MM/YYYY',
  FULL = 'HH:mm:ss DD/MM/YYYY',
}

export enum TimeVariant {
  NATURE = 'nature', // HH:mm:ss - DD/MM/YYYY
  MACHINE = 'machine', // YYYY/MM/DD - HH:mm:ss
}

export type TimeFormat = {
  day?: boolean;
  month?: boolean;
  year?: boolean;
  hour?: boolean;
  minute?: boolean;
  second?: boolean;
  variant?: TimeVariant;
  showTime?: boolean;
  showDate?: boolean;
};

const time: TimeFormat = {
  hour: true,
  minute: true,
  second: true,
  showTime: true,
};

const date: TimeFormat = {
  day: true,
  month: true,
  year: true,
  showDate: true,
};

export const TimeFormats: Record<string, TimeFormat> = {
  full: {
    ...time,
    ...date,
  },
  time,
  date,
};
