/* eslint-disable @typescript-eslint/no-explicit-any */
import { HeatmapPoint } from '@/helpers/canvas-utils';
import { JSXElement } from 'solid-js';

export type InsightLayer = {
  name: string;
  description: string;
  pointsProvider?: () => Promise<HeatmapPoint[]>;
  color: string;
  configComponent?: (layer: InsightLayer) => JSXElement;
  config?: any;
  selected?: boolean;
  canvas?: HTMLCanvasElement;
};
