export type CounterOptions = {
  max?: number;
};

export class Counter<Type> {
  counted = 0;
  countedIds: string[] = [];

  idProvider?: (item: Type) => string;

  get isFull() {
    return this.remaining <= 0;
  }

  get remaining() {
    return this.options.max
      ? this.options.max - this.counted
      : Number.MAX_SAFE_INTEGER;
  }

  constructor(public options: CounterOptions) {}

  reset() {
    this.counted = 0;
  }

  count(data: Type[]) {
    const remaining = this.options.max
      ? this.options.max - this.counted
      : data.length;

    const validData = remaining < data.length ? data.slice(0, remaining) : data;

    this.counted += validData.length;

    return validData;
  }

  flexCount(data: Type[]) {
    // Vẫn đếm nhưng trả về tất cả dữ liệu, k lọc bớt
  }
}
