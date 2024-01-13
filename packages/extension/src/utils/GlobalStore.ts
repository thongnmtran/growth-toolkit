/* eslint-disable @typescript-eslint/no-explicit-any */
export default class GlobalStore {
  static prefix = '';

  static get store() {
    return localStorage;
  }

  static getKey(key: string) {
    return `${this.prefix}${key}`;
  }

  static getAnyKey(key: string) {
    const prefixedKey = this.getKey(key);
    return this._has(prefixedKey) ? prefixedKey : key;
  }

  static set(key: string, value: any) {
    const pfKey = this.getKey(key);
    const curItem = this.get(key);
    try {
      this.remove(pfKey);
      this.store.setItem(pfKey, JSON.stringify(value));
    } catch (error) {
      this.store.setItem(pfKey, JSON.stringify(curItem));
      throw error;
    }
    return value;
  }

  static get<Type>(key: string, defaultValue?: Type): Type {
    const anyKey = this.getAnyKey(key);
    if (!this.has(key)) {
      return defaultValue as never;
    }
    try {
      return JSON.parse(this.store.getItem(anyKey) as never);
    } catch (error) {
      // Remove broken record
      this.remove(key);
      return defaultValue as never;
    }
  }

  static has(key: string) {
    const anyKey = this.getAnyKey(key);
    return anyKey in this.store;
  }

  static _has(key: string) {
    return key in this.store;
  }

  static remove(key: string) {
    const pfKey = this.getKey(key);
    this.store.removeItem(key);
    this.store.removeItem(pfKey);
  }

  static clear() {
    this.store.clear();
  }

  static restore(
    key: string,
    setter: (value: any) => unknown,
    defaultValue: any,
  ) {
    const item = this.get(key, defaultValue);
    setter(item);
    return item;
  }
}
