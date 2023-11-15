export type SN = string | number;

export type Join<Parts extends SN[], SP extends SN = ' '> = Parts extends [
  infer First extends SN
]
  ? First
  : Parts extends [infer First extends SN, infer Second extends SN]
  ? `${First}${SP}${Second}`
  : Parts extends [
      infer First extends SN,
      infer Second extends SN,
      ...infer Rest extends SN[]
    ]
  ? `${Join<[First, Second], SP>}${SP}${Join<Rest, SP>}`
  : never;

export type Combination<
  Parts extends SN[],
  SP extends SN = ' '
> = Parts extends [infer First extends SN]
  ? First
  : Parts extends [infer First extends SN, ...infer Rest extends SN[]]
  ? First | `${First}${SP}${Combination<Rest, SP>}` | Combination<Rest, SP>
  : never;
