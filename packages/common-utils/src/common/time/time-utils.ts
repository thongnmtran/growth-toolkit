import { Converter, Unit, convertMany, convert, ms as toMS } from 'convert';
import moment from 'moment';
import 'moment/locale/vi';
import {
  AnyTimeInput,
  CommonTimeFormat,
  Duration,
  isDuration,
  TimeInputString,
} from './time-types';
import { buildTimeFormat } from './TimeFormatBuilder';
import humanizeDuration from 'humanize-duration';
import { filterNull } from '../array-utils';

moment.locale('vi');

function parseTime(time: TimeInputString) {
  return time.replace(/(\d+)m\b/g, '$1min');
}

/**
 * 1d 2h 3m 4s 5ms
 * @see https://www.npmjs.com/package/convert
 */
export function time(time: TimeInputString): Converter<number, Unit> {
  return convertMany(parseTime(time));
}

/**
 * 1d 2h 3m 4s 5ms
 * @see https://www.npmjs.com/package/convert
 */
export function ms(time: TimeInputString): number {
  return toMS(parseTime(time));
}

export function asTimestamp(time: string): number {
  if (!time) {
    return 0;
  }
  if (typeof time === 'string') {
    return new Date(time).getTime();
  }
  return +time || 0;
}

export function formatTime(
  time: AnyTimeInput,
  format: string = CommonTimeFormat.FULL
): string {
  return moment(time).format(format);
}

export function asTimeString(
  time?: AnyTimeInput,
  format: string = CommonTimeFormat.FULL
): string {
  return time ? moment(time).format(format) : '';
}

export function asTimeRange(params?: {
  from?: AnyTimeInput;
  to?: AnyTimeInput;
}): string {
  const from = moment(params?.from);
  const to = moment(params?.to);

  const isSameYear = from.year() === to.year();
  const isSameMonth = from.month() === to.month();
  const isSameDay = from.date() === to.date();

  const parts: string[] = [];

  const fromFormat = buildTimeFormat()
    .showDate(true)
    .showTime(false)
    .year(!isSameYear)
    .month(!isSameMonth || !isSameYear)
    .day(!isSameDay || !isSameMonth || !isSameYear)
    .build();
  const fromString = fromFormat && formatTime(from, fromFormat);

  if (fromString) {
    parts.push(fromString);
  }

  const toString = formatTime(to, CommonTimeFormat.DATE);
  parts.push(toString);

  return parts.join(' - ');
}

export function parseAnyTime(time?: AnyTimeInput) {
  if (!time) {
    return 0;
  }
  if (typeof time === 'number') {
    return time;
  }
  if (typeof time === 'string') {
    const number = Number(time);
    if (!Number.isNaN(number)) {
      return number;
    }
    const date = new Date(time);
    return String(date) === 'Invalid Date' ? ms(time as never) : date.getTime();
  }
  if (isDuration(time)) {
    return (
      time.days * 86400000 +
      time.hours * 3600000 +
      time.mins * 60000 +
      time.secs * 1000
    );
  }
  return time?.valueOf() || 0;
}

export function calcDuration(from: AnyTimeInput, to: AnyTimeInput) {
  return parseAnyTime(to) - parseAnyTime(from);
}

export function asTimeFromNow(time: AnyTimeInput) {
  const timez = parseAnyTime(time);
  const remaining = timez - Date.now();
  const isLessThanAMinute = Math.abs(remaining) < 60000;
  const isFuture = remaining >= 0;
  const seconds = Math.round(Math.abs(remaining) / 1000);
  return isLessThanAMinute
    ? `${seconds} giây ${isFuture ? 'tới' : 'trước'}`
    : moment(timez).locale('vi').fromNow();
}

export function asDuration(duration: AnyTimeInput, useDetails = false) {
  let time = parseAnyTime(duration);

  if (time) {
    time = Math.round(time / 1000) * 1000;
  }

  const isBefore = time < 0;

  const timeString = humanizeDuration(time, {
    language: 'vi',
    delimiter: ' ',
    units: ['y', 'mo', 'd', 'h', 'm', 's'],
    largest: 2,
  });

  if (!useDetails) {
    return timeString;
  }

  return `${isBefore ? '' : 'sau '}${timeString}${isBefore ? ' trước' : ''}`;
}

export function hasTimedOut(startTime: number, timeout: AnyTimeInput) {
  return Date.now() - startTime > parseAnyTime(timeout);
}

export function createDateAsUTC(date: Date) {
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    )
  );
}

export function convertDateToUTC(date: Date) {
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );
}

export function parseDuration(rawDuration: AnyTimeInput): Duration {
  const duration = parseAnyTime(rawDuration);
  const date = convertDateToUTC(new Date(duration));
  return {
    days: Math.floor(convert(duration, 'ms').to('days')),
    hours: date.getHours(),
    mins: date.getMinutes(),
    secs: date.getSeconds(),
  };
}

export function stringifyDuration(duration: AnyTimeInput) {
  const time = parseDuration(duration);
  return filterNull([
    time.days && `${time.days}d`,
    time.hours && `${time.hours}h`,
    time.mins && `${time.mins}m`,
    time.secs && `${time.secs}s`,
  ]).join(' ');
}

export function toTimeInputString(duration: AnyTimeInput) {
  const time = parseDuration(duration);
  return stringifyDuration(time);
}

export function dateToDuration(date: AnyTimeInput, direction = 0) {
  const time = parseAnyTime(date);
  const duration = time - Date.now();
  return direction ? direction * duration : Math.abs(duration);
}

export function durationToDate(duration: AnyTimeInput, direction = 0) {
  const durationTime = parseAnyTime(duration);
  const date =
    Date.now() - (direction ? direction * durationTime : durationTime);
  return date;
}
