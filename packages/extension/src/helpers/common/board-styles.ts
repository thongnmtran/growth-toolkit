import { gridSize, lineWidth } from '../canvas-utils';

export enum MiroColor {
  WHITE = '#ffffff',
  LIGHT_YELLOW = '#fef445',
  YELLOW = '#fac710',
  RED = '#f24726',
  LIGHT_GRAY = '#e6e6e6',
  LIGHT_GREEN = '#cee741',
  GREEN = '#8fd14f',
  MAGENTA = '#da0063',
  GRAY = '#808080',
  CYAN = '#12cdd4',
  DARK_GREEN = '#0ca789',
  PURPLE = '#652cb3',
  BLACK = '#1a1a1a',
  BLUE = '#2d9bf0',
  DARK_BLUE = '#414bb2',
  VIOLET = '#9510ac',
  TRUE_RED = '#ff0000',
  SAND = '#ffd69b',
  INDIGO = '#312456',
}

export enum ModulePalette {
  FREE = MiroColor.BLACK,
  PAID = MiroColor.VIOLET,
}

export type LevelStyle = {
  lineWidth: number;
  fontSize: number;
  gridSize: number;
  size: [number, number?];
  paddingLeft?: number;
};

export const LEVEL_STYLES: LevelStyle[] = [
  {
    lineWidth: lineWidth(10),
    fontSize: 288,
    gridSize: gridSize(10),
    size: [3072],
    paddingLeft: 1152,
  },
  {
    lineWidth: lineWidth(10),
    fontSize: 144,
    gridSize: gridSize(9),
    size: [1536],
  },
  {
    lineWidth: lineWidth(9),
    fontSize: 80,
    gridSize: gridSize(8),
    size: [1536, 288],
  },
  {
    lineWidth: lineWidth(8),
    fontSize: 64,
    gridSize: gridSize(7),
    size: [1321, 192],
  },
  {
    lineWidth: lineWidth(7),
    fontSize: 48,
    gridSize: gridSize(6),
    size: [816, 155],
  },
  {
    lineWidth: lineWidth(6),
    fontSize: 36,
    gridSize: gridSize(5),
    size: [816, 111],
  },
  {
    lineWidth: lineWidth(5),
    fontSize: 36,
    gridSize: gridSize(4),
    size: [816, 96],
  },
  {
    lineWidth: lineWidth(4),
    fontSize: 36,
    gridSize: gridSize(3),
    size: [543, 90],
  },
  {
    lineWidth: lineWidth(3),
    fontSize: 36,
    gridSize: gridSize(2),
    size: [543, 90],
  },
  {
    lineWidth: lineWidth(2),
    fontSize: 36,
    gridSize: gridSize(1),
    size: [543, 90],
  },
  {
    lineWidth: lineWidth(1),
    fontSize: 36,
    gridSize: gridSize(1),
    size: [543, 90],
  },
];
