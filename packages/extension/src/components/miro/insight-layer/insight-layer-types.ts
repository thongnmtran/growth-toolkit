/* eslint-disable @typescript-eslint/no-explicit-any */
import { HeatmapPoint } from '@/helpers/canvas-utils';
import { JSXElement } from 'solid-js';
import { InsightLayerName } from './insightLayers';

export type InsightLayer = {
  name: string;
  description: string;
};

export type RawUIInsightLayer<ConfigType = any> = {
  color: string;
  pointsProvider?: (
    layer: RawUIInsightLayer<ConfigType>,
  ) => Promise<HeatmapPoint[]>;
  configComponent?: (layer: RawUIInsightLayer<ConfigType>) => JSXElement;
  config?: ConfigType;
  selected?: boolean;
  canvas?: HTMLCanvasElement;
  glossary?: InsightLayerGlossary[];
};

export type InsightLayerGlossary = {
  color: string;
  definition: string;
};

export type InsightLayerMap = {
  [key in InsightLayerName]?: RawUIInsightLayer<any>;
};
