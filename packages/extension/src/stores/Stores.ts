import { indexDB } from '../core/IDBWrapper';

export class Stores {
  private static stores: Record<string, IDBObjectStore> = {};

  static getStore(
    name: string,
    mode: IDBTransactionMode = 'readonly',
    forceNew = false
  ) {
    const db = indexDB;

    let store = this.stores[name];
    if (store && !forceNew) {
      const isAlive = !store.transaction.error;
      const isUsable = store.transaction.mode.includes(mode);

      if (isAlive && isUsable) {
        return store;
      }
    }

    store = db.db
      .transaction(name, mode, {
        durability: 'relaxed',
      })
      .objectStore(name);
    this.stores[name] = store;

    return store;
  }
}
