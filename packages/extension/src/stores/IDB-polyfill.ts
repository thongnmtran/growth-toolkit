/* eslint-disable @typescript-eslint/no-explicit-any */
const _window = window as any;

// window.indexedDB =
//   window.indexedDB ||
//   _window.mozIndexedDB ||
//   _window.webkitIndexedDB ||
//   _window.msIndexedDB;

window.IDBTransaction = window.IDBTransaction ||
  _window.webkitIDBTransaction ||
  _window.msIDBTransaction || { READ_WRITE: 'readwrite' };

window.IDBKeyRange =
  window.IDBKeyRange || _window.webkitIDBKeyRange || _window.msIDBKeyRange;

export {};
