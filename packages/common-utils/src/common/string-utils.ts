export const DEFAULT_CONSOLE_WIDTH = 80;

export enum FrameCharater {
  H_EDGE = '─',
  V_EDGE = '│',
  TOP_LEFT = '┌',
  TOP_RIGHT = '┐',
  BOTTOM_LEFT = '└',
  BOTTOM_RIGHT = '┘',
}

export function frameHeader(length = DEFAULT_CONSOLE_WIDTH) {
  return new Array(length)
    .fill(FrameCharater.H_EDGE)
    .fill(FrameCharater.TOP_LEFT, 0, 1)
    .fill(FrameCharater.TOP_RIGHT, length - 1, length)
    .join('');
}

export function frameBody(content = '', length = DEFAULT_CONSOLE_WIDTH) {
  const adjust = content.length ? 1 : 0;
  const arrayLength = length - content.length + adjust;
  const contentStart = Math.round(arrayLength / 2);
  const contentEnd = contentStart + adjust;
  return new Array(arrayLength)
    .fill(' ')
    .fill(FrameCharater.V_EDGE, 0, 1)
    .fill(content, contentStart, contentEnd)
    .fill(FrameCharater.V_EDGE, arrayLength - 1, arrayLength)
    .join('');
}

export function frameFooter(length = DEFAULT_CONSOLE_WIDTH) {
  return new Array(length)
    .fill(FrameCharater.H_EDGE)
    .fill(FrameCharater.BOTTOM_LEFT, 0, 1)
    .fill(FrameCharater.BOTTOM_RIGHT, length - 1, length)
    .join('');
}

export function toTitleCase(text: string) {
  return text?.replace(
    /\w\S*/g,
    (txt) => txt[0]?.toUpperCase() + txt.slice(1).toLowerCase(),
  );
}

/**
 * "/my-pattern/gimy"
 */
export function parseRegex(patternString: string): RegExp {
  const [, flags = ''] = patternString.match(/.*\/([gimy]*)$/) || [];
  const pattern = patternString.replace(
    new RegExp(`^\\/(.*?)\\/${flags}$`),
    '$1',
  );
  const regex = new RegExp(pattern, flags);
  return regex;
}

export function jsonStringify(value: unknown) {
  return JSON.stringify(
    value,
    (_key, value) => {
      return value instanceof RegExp ? String(value) : value;
    },
    2,
  );
}

export function escapeNewLine<Type>(text: Type) {
  if (typeof text !== 'string') {
    return text;
  }
  return text.replace(/\n/g, ' ꜜ ');
}

export function findUniqueName<ItemType, NameProp extends keyof ItemType>(
  name: string,
  items: ItemType[] = [],
  nameProp: NameProp = 'name' as NameProp,
) {
  let newName = name;
  let counter = 0;
  while (items.some((item) => item[nameProp] === newName)) {
    counter += 1;
    newName = `${name} (${counter})`;
  }
  return newName;
}
