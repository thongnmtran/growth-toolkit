import { IdDoc } from './IdDoc';
import { DocId } from './DocId';

export interface Doc extends IdDoc {
  _id: DocId;
}
