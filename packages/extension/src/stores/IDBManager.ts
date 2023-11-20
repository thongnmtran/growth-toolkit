/* eslint-disable @typescript-eslint/no-unused-vars */
import { ModelNames } from '@growth-toolkit/common-models';
import { openDB, IDBPDatabase } from 'idb';

export class IDBManager {
  db!: IDBPDatabase;

  static instance: IDBManager;

  constructor(
    private name: string,
    private version: number,
  ) {
    IDBManager.instance = this;
  }

  async init() {
    if (this.db) {
      return this.db;
    }

    const db = await openDB(this.name, this.version, {
      upgrade(db, oldVersion, newVersion, transaction, event) {
        for (const storeName of Object.values(ModelNames)) {
          try {
            db.createObjectStore(storeName, { keyPath: '_id' });
          } catch {
            //
          }
        }
      },
      blocked(currentVersion, blockedVersion, event) {
        // …
      },
      blocking(currentVersion, blockedVersion, event) {
        // …
      },
      terminated() {
        // …
      },
    });

    this.db = db;
    return db;

    // return new Promise<IDBDatabase>((resolve, reject) => {
    //   const openRequest = window.indexedDB.open(this.name, this.version);
    //   openRequest.onsuccess = () => {
    //     const db = openRequest.result;
    //     this.db = db;
    //     db.onversionchange = () => {
    //       db.close();
    //       alert(
    //         'Phiên bản mới đã được cập nhập! Vui lòng đóng hết các tab của app và tải lại trang.',
    //       );
    //     };
    //     resolve(this.db);
    //   };
    //   openRequest.onerror = (event) => {
    //     reject(event);
    //   };
    //   openRequest.onblocked = () => {
    //     alert(
    //       'Dữ liệu đang được sử dụng! Vui lòng đóng các tab khác của app và tải lại trang.',
    //     );
    //   };
    //   openRequest.onupgradeneeded = (event) => {
    //     this.db = (event.target as any)?.result;
    //     this.initStores();
    //   };
    // });
  }

  // async initStores() {
  //   await Promise.all(
  //     Object.values(this.stores).map(async (storeInfoI) => {
  //       try {
  //         const storeI = this.db.createObjectStore(
  //           storeInfoI.name,
  //           storeInfoI.options,
  //         );
  //         storeInfoI.indexes?.forEach((indexI) => {
  //           storeI.createIndex(indexI.name, indexI.keyPath, indexI.options);
  //         });
  //         return waitForStore(storeI);
  //       } catch {
  //         //
  //       }
  //     }),
  //   );
  // }

  // stores: Record<string, StoreInfo> = {};

  // registerStore(info: StoreInfo) {
  //   this.stores[info.name] = info;
  // }

  // registerModelStore(name: StoreInfo['name'], indexes?: StoreInfo['indexes']) {
  //   this.registerStore({
  //     name,
  //     indexes,
  //     options: {
  //       keyPath: '_id',
  //     },
  //   });
  // }
}
