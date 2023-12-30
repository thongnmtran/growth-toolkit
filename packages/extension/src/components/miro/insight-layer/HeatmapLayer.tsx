import { myMiro } from '@/helpers/MyMiro';
import { InsightLayer } from './insight-layer-types';
import { HeatmapPoint } from '@/helpers/canvas-utils';
import { filterNull } from '@growth-toolkit/common-utils';

export const HeatmapLayer: () => InsightLayer = () => ({
  name: '🔥 Heatmap',
  description: 'Where users use most',
  color: '255,0,0',
  pointsProvider: async () => {
    const nodes = await myMiro.getModuleNodes();
    const maxValue = Math.max(
      ...nodes.map((node) => {
        const usages = myMiro.getModuleInfo(node.id).usages;
        const value = usages.find((usage) => usage.monthlyUsage)?.monthlyUsage;
        return value || 0;
      }),
    );

    const points: HeatmapPoint[] = filterNull(
      nodes.map((node) => {
        const usages = myMiro.getModuleInfo(node.id).usages;
        const value = usages.find((usage) => usage.monthlyUsage)?.monthlyUsage;
        if (!value) {
          return undefined;
        }
        const { x, y, width, height } = myMiro.getNodeRectInCanvas(node);
        return {
          x,
          y,
          width,
          height,
          value: +value / maxValue,
        };
      }),
    ) as never;

    return points;
  },
});
