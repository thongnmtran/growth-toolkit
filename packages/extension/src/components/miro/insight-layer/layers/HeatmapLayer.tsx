import { myMiro } from '@/helpers/MyMiro';
import { RawUIInsightLayer } from '../insight-layer-types';
import { HeatmapPoint } from '@/helpers/canvas-utils';
import { filterNull } from '@growth-toolkit/common-utils';
import { Stack } from '@suid/material';
import CSelect from '@/components/common/CSelect';

export type HeatmapLayerConfig = {
  segment: string;
};

export type HeatmapLayer = RawUIInsightLayer<HeatmapLayerConfig>;

export const heatmapLayer: () => HeatmapLayer = () => ({
  name: '🔥 Heatmap',
  description: 'Where users use most',
  color: '255,0,0',
  config: {
    segment: 'All',
  },
  configComponent: (layer: RawUIInsightLayer) => {
    return (
      <Stack spacing={1}>
        <CSelect
          label="Target Competitor"
          options={[
            'All',
            ...myMiro.config.segments.map((segment) => segment.name),
          ]}
          value={layer.config?.segment || ''}
          onChange={(event) => {
            if (!layer.config) {
              layer.config = {};
            }
            layer.config.segment = event.target.value;
          }}
          fullWidth
        />
      </Stack>
    );
  },
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
