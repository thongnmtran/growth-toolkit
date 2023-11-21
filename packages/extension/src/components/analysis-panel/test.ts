/* eslint-disable @typescript-eslint/no-unused-vars */
type A = {
  a: number;
  b: string;
  c: number;
};

type B = {
  a: string;
  b: number;
  d: string;
};

// ---
type C = {
  a: number | string;
  b: number | string;
  c: number;
  d: string;
};

type C2 = {
  // [K in keyof A | keyof B]: K extends keyof A
  //   ? K extends keyof B
  //     ? A[K] | B[K]
  //     : A[K]
  //   : K extends keyof B
  //     ? B[K]
  //     : never;

  [K in keyof A | keyof B]: K extends keyof A
    ? A[K]
    : never | (K extends keyof B ? B[K] : never);
};

const c1: C = {
  a: 'a',
  b: 'b',
};

const c2: C = {
  a: 123,
  b: 123,
};
