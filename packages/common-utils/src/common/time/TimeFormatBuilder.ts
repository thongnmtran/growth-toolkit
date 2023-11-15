import { TimeVariant, TimeFormat } from './time-types';

export class TimeFormatBuilder {
  #parts: TimeFormat = {
    variant: TimeVariant.NATURE,
  };

  constructor(parts?: TimeFormat) {
    Object.assign(this.#parts, parts);
  }

  showTime(enable = true) {
    this.#parts.showTime = enable;
    return this;
  }

  showDate(enable = true) {
    this.#parts.showDate = enable;
    return this;
  }

  variant(variant?: TimeVariant) {
    this.#parts.variant = variant;
    return this;
  }

  nature(enable = true) {
    this.#parts.variant = enable ? TimeVariant.NATURE : undefined;
    return this;
  }

  machine(enable = true) {
    this.#parts.variant = enable ? TimeVariant.MACHINE : undefined;
    return this;
  }

  hour(enable = true) {
    this.#parts.hour = enable;
    return this;
  }

  minute(enable = true) {
    this.#parts.minute = enable;
    return this;
  }

  second(enable = true) {
    this.#parts.second = enable;
    return this;
  }

  day(enable = true) {
    this.#parts.day = enable;
    return this;
  }

  month(enable = true) {
    this.#parts.month = enable;
    return this;
  }

  year(enable = true) {
    this.#parts.year = enable;
    return this;
  }

  buildTime() {
    const time = [];
    if (this.#parts.hour) {
      time.push('HH');
    }
    if (this.#parts.minute) {
      time.push('mm');
    }
    if (this.#parts.second) {
      time.push('ss');
    }
    return time.join(':');
  }

  buildDate() {
    const date = [];
    if (this.#parts.day) {
      date.push('DD');
    }
    if (this.#parts.month) {
      date.push('MM');
    }
    if (this.#parts.year) {
      date.push('YYYY');
    }
    if (this.#parts.variant === TimeVariant.MACHINE) {
      date.reverse();
    }
    return date.join('/');
  }

  build() {
    const parts = [];
    if (this.#parts.showTime) {
      parts.push(this.buildTime());
    }
    if (this.#parts.showDate) {
      parts.push(this.buildDate());
    }
    if (this.#parts.variant === TimeVariant.MACHINE) {
      parts.reverse();
    }
    return parts.join(' - ');
  }
}

export function buildTimeFormat(parts?: TimeFormat) {
  return new TimeFormatBuilder(parts);
}
