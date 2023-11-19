/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  isArray,
  AnyOf,
  randomDocId,
  fragment,
  Fragment,
} from '@growth-toolkit/common-utils';
import { AnyDoc, DocId, IdDoc, OrderableModel } from '../base';
import { ModelRef } from '../base/common/ModelRef';

export const DOC_ID_LENGTH = '625e52ab84e89b63f9741105'.length;

// --- Extractors

export function getId(doc: unknown): DocId {
  if (!doc) {
    return '';
  }
  if (typeof doc === 'string') {
    return doc;
  }
  if (doc?.constructor?.name === 'ObjectId') {
    return doc.toString();
  }
  return getId((doc as any)?._id) || getId((doc as any)?.id);
}

export function getIds<DocType extends IdDoc>(
  docs: AnyOf<DocType | unknown>[],
) {
  return docs.map((docI) => getId(docI));
}

// --- Assertions

export function isSameDoc(docA: unknown, docB: unknown) {
  return docA === docB || getId(docA) === getId(docB);
}

export function isDocId(doc: AnyDoc) {
  return typeof doc === 'string';
}

export function hasId<DocType>(doc: AnyOf<DocType>) {
  return !!getId(doc);
}

export function isValidDoc<DocType>(doc: AnyOf<DocType>) {
  return hasValidId(doc);
}

export function hasValidId<DocType>(doc: AnyOf<DocType>) {
  return isValidId(getId(doc));
}

export function hasNoValidId<DocType>(doc: AnyOf<DocType>) {
  return !isValidId(getId(doc));
}

export function isValidId(docId: AnyOf<DocId>) {
  return docId && String(docId).length === DOC_ID_LENGTH;
}

export function isDocIdOrIds(
  docOrDocs: AnyDoc | AnyDoc[],
): docOrDocs is DocId | DocId[] {
  return isArray(docOrDocs, 'string') || (isDocId(docOrDocs) as never);
}

export function removeId<DocType extends IdDoc>(doc: DocType): DocType {
  if (!doc || typeof doc !== 'object') {
    return doc;
  }
  ['id', '_id'].forEach((idKey) => {
    delete (doc as any)[idKey];
  });
  return doc;
}

export function removeIds<DocType extends IdDoc>(docs: DocType[]): DocType[] {
  return docs.map((docI) => removeId(docI));
}

export function removeTempId<DocType extends IdDoc>(doc: DocType): DocType {
  if (!doc || typeof doc !== 'object') {
    return doc;
  }
  ['id'].forEach((idKey) => {
    delete (doc as any)[idKey];
  });
  return doc;
}

export function removeTempIds<DocType extends IdDoc>(
  docs: DocType[],
): DocType[] {
  return docs.map((docI) => removeTempId(docI));
}

export function sortByOrder<DocType extends OrderableModel>(
  docs: DocType[],
  oldestFirst = true,
) {
  return docs.sort(
    (docA, docB) => (docA.order - docB.order) * (oldestFirst ? 1 : -1),
  );
}

export function attachTempId<DocType extends IdDoc>(
  doc: DocType,
  idGenerator: (docI: DocType) => string = randomDocId,
) {
  doc.id = idGenerator(doc);
  return doc;
}

export function attachTempIds<DocType extends IdDoc>(
  docs: DocType[],
  idGenerator: (docI: DocType) => string = randomDocId,
) {
  docs.forEach((docI) => attachTempId(docI, idGenerator));
  return docs;
}

export function fromId(docId: unknown): any {
  return {
    _id: getId(docId as never),
  };
}

export function modelFragment<Model, Keys extends keyof Model>(
  doc: Model,
  ...props: Keys[]
): Fragment<Doc<Model>, Keys | '_id'> {
  return fragment(doc, '_id' as never, ...(props as never[])) as never;
}

export function findModel<DocType>(docs: DocType[], docRef: ModelRef<DocType>) {
  return docs.find((docI) => isSameDoc(docI, docRef));
}

export function findModels<DocType>(
  docs: DocType[],
  ...docRefs: ModelRef<DocType>[]
) {
  return docRefs.map((docRefI) => findModel(docs, docRefI));
}

export function purifyModel<DocType>(doc: DocType): DocType {
  const clone = JSON.parse(JSON.stringify(doc));
  Object.entries(clone as any).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      clone[key as never] = value.map((valueI) => {
        return isValidDoc(valueI) ? getId(valueI) : valueI;
      }) as never;
    } else if (isValidDoc(value)) {
      clone[key as never] = getId(value) as never;
    }
  });
  return clone;
}
