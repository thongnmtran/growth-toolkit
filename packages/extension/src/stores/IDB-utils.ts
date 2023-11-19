/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoQuery, MongoQueryOptions } from '@growth-toolkit/common-models';
import {
  Nullable,
  asArrayIfNotNull,
  asItem,
  safeCall,
  sort,
} from '@growth-toolkit/common-utils';
import sift from 'sift';

export type IDBFilter<DataType> = MongoQuery<DataType>;

export type IDBQueryOptions<DataType> = MongoQueryOptions<DataType>;

export type UpdateQuery<DataType, FilterType> = {
  update: DataType;
  where: FilterType;
};

export type IDBUpdateQuery<DataType> = UpdateQuery<
  DataType,
  IDBFilter<DataType>
>;

export function isIDBQuery<DataType extends object>(
  query: string | string[] | DataType | DataType[] | IDBFilter<DataType>,
): query is IDBFilter<DataType> {
  if (typeof query === 'string' || Array.isArray(query)) {
    return false;
  }
  return 'where' in query;
}

export function isIDBUpdateQuery<DataType extends object>(
  query: DataType | DataType[] | IDBUpdateQuery<DataType>,
): query is IDBUpdateQuery<DataType> {
  if (typeof query === 'string' || Array.isArray(query)) {
    return false;
  }
  return 'where' in query;
}

export async function waitForStore(store: IDBObjectStore) {
  return waitForTransaction(store.transaction);
}

export async function waitForRequest(request: IDBRequest) {
  if (request.readyState === 'done') {
    return Promise.resolve(request.result);
  }
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = reject;
  });
}

export async function waitForTransaction(transaction?: IDBTransaction | null) {
  if (!transaction) {
    return;
  }
  return new Promise((resolve, reject) => {
    transaction.oncomplete = resolve;
    transaction.onerror = reject;
    transaction.onabort = reject;
  });
}

// --- Read

export async function getById(id: string, store: IDBObjectStore) {
  return waitForRequest(store.getKey(id));
}

// --- Create

export async function createOrUpdateDoc<DataType>(
  storeProvider: () => IDBObjectStore,
  doc: DataType,
) {
  try {
    await createDoc(storeProvider(), doc);
  } catch (error) {
    await updateDoc(storeProvider(), doc);
  }
  return doc;
}

export async function safeCreateDoc(store: IDBObjectStore, ...docs: unknown[]) {
  return safeCall(() => createDoc(store, ...docs));
}

export async function createDoc(store: IDBObjectStore, ...docs: unknown[]) {
  await Promise.all(docs.map((docI) => waitForRequest(store.add(docI))));
}

// --- Update

export async function safeUpdateDoc(store: IDBObjectStore, doc: unknown) {
  return safeCall(() => updateDoc(store, doc));
}

export async function updateDoc<DataType>(
  store: IDBObjectStore,
  doc: DataType,
) {
  return waitForRequest(store.put(doc));
}

export async function updateDocs<DataType>(
  store: IDBObjectStore,
  docs: DataType[],
) {
  return Promise.all(
    docs.map((docI) => {
      return waitForRequest(store.put(docI));
    }),
  );
}

export async function findAndUpdate<DataType>(
  store: IDBObjectStore,
  query: IDBUpdateQuery<DataType>,
  options?: IDBQueryOptions<DataType>,
): Promise<DataType[]> {
  const updatedDocs: DataType[] = [];
  await forEachDoc(store, query, options, ({ record, cursor }) => {
    const update = { ...record, ...query.update };
    updatedDocs.push(update);
    return waitForRequest(cursor.update(update));
  });
  return updatedDocs;
}

// --- Delete

export async function deleteDocs(store: IDBObjectStore, docs: any | any[]) {
  const keyPath = asItem(store.keyPath);
  return Promise.all(
    asArrayIfNotNull(docs).map((docI) =>
      waitForRequest(store.delete((docI as any)[keyPath])),
    ),
  );
}

export async function deleteDocIds(
  store: IDBObjectStore,
  docIds: string | string[],
) {
  return Promise.all(
    asArrayIfNotNull(docIds).map((docIdI) =>
      waitForRequest(store.delete(docIdI)),
    ),
  );
}

export async function searchAndDeleteDocs<DataType>(
  store: IDBObjectStore,
  query: IDBFilter<DataType>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options?: IDBQueryOptions<DataType>,
) {
  await forEachDoc(store, query, options, async ({ cursor }) => {
    await waitForRequest(cursor.delete());
  });
  await waitForTransaction(store.transaction);
}

export async function searchDocs<DataType>(
  store: IDBObjectStore,
  query: IDBFilter<DataType>,
  options?: IDBQueryOptions<DataType>,
): Promise<DataType[]> {
  const matches: DataType[] = [];
  await forEachDoc<DataType>(store, query, options, ({ record }) => {
    matches.push(record);
  });
  return sort(matches, options?.sort || '');
}

// ---

export async function forEachDoc<DataType>(
  store: IDBObjectStore,
  query: IDBFilter<DataType>,
  options: Nullable<IDBQueryOptions<DataType>>,
  func: (params: {
    record: DataType;
    cursor: IDBCursor;
  }) => Promise<void> | void,
) {
  return new Promise((resolve, reject) => {
    let counter = 0;
    const request = store.openCursor(null);
    const matcher = sift(query);
    request.onsuccess = async (event) => {
      const cursor = (event.target as any).result;
      if (cursor) {
        const doc = cursor.value;
        if (matcher(doc)) {
          counter++;
          await func({ record: doc, cursor });
        }
        if (options?.limit && counter >= options.limit) {
          resolve(undefined);
          return;
        }
        cursor.continue();
      } else {
        resolve(undefined);
      }
    };
    request.onerror = reject;
  });
}
