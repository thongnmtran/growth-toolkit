import { InsightLayer } from './insight-layer-types';

export const insightLayers = {
  competitorMap: {
    name: '⚔ Competitor Map',
    description: 'Where we win and where we lose against competitors',
  },
  monetarizeMap: {
    name: '💰 Monetarize Map',
    description: 'Where free modules can be monetarized',
  },
  bleedingMap: {
    name: '🩸 Bleeding Map',
    description: 'Where our money are leaking',
  },
  losingMap: {
    name: '😥 Losing Map',
    description: 'Where our the deals are losing',
  },
  churningMap: {
    name: '📉 Churning Map',
    description: 'Where churned users use most',
  },
  heatmap: {
    name: '🔥 Heatmap',
    description: 'Where users use most',
  },
  qualityMap: {
    name: '✅ Quality Map',
    description: 'Module quality map',
  },
  satisfactionMap: {
    name: '💖 Satisfaction Map',
    description: 'User satisfaction map',
  },
  riskMap: {
    name: '⚠ Risk Map',
    description: 'Where our deals are at risk',
  },
} satisfies Record<string, InsightLayer>;

export type InsightLayerName = keyof typeof insightLayers;
