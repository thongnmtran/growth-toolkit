import { DocId } from './DocId';

export interface IdDoc {
  id: DocId;
}

export type AnyDoc = DocId | IdDoc | null | undefined;
