/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomDocId } from './math-utils';

function getId(doc: any) {
  return doc.id || doc._id;
}

export const Funcs = {
  func: (..._args: []): any => {},
  onFunc: (..._args: []): any => {},
  nullFunc: (..._args: []): any => null,
  stringFunc: (..._args: []): any => '',
  numberFunc: (..._args: []): any => 0,
  arrayFunc: (..._args: []): any => [],
  objectFunc: (..._args: []): any => ({}),
  randomFunc: (..._args: []): any => Math.random(),
  sameFunc: (...args: any[]) => args[0],
  trueFunc: (..._args: any[]) => true,
  asyncTrueFunc: async (..._args: any[]) => true,
  falseFunc: (..._args: any[]) => false,
  asyncFalseFunc: async (..._args: any[]) => false,
  labelProvider: (...args: any[]) => String(args[0]),
  docIdFunc: getId, // ModelHelper.getId
  anyDocIdFunc: (doc: any) => getId(doc) || randomDocId(),
  // anyDocIdFunc: (doc: any) => ModelHelper.getId(doc) || Random.docId(),
};
