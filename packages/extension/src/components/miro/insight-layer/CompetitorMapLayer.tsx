import CSelect from '@/components/common/CSelect';
import { InsightLayer } from './insight-layer-types';
import { Stack } from '@suid/material';
import { HeatmapPoint } from '@/helpers/canvas-utils';
import { Competitor, LicenseType } from '@/models/ModuleInfo';
import { myMiro } from '@/helpers/MyMiro';
import { filterNull } from '@growth-toolkit/common-utils';
import { Accessor } from 'solid-js';

export const CompetitorMapLayer: (
  competitors: Accessor<Competitor[]>,
) => InsightLayer = (competitors) => ({
  name: '⚔ Competitor Map',
  description: 'Where we win and where we lose against competitors',
  color: '255, 95, 21',
  config: {
    competitor: 'LambdaTest',
  },
  configComponent: (layer: InsightLayer) => {
    return (
      <Stack spacing={1}>
        <CSelect
          label="Target Competitor"
          options={competitors().map((competitor) => competitor.name)}
          value={layer.config?.competitor || ''}
          onChange={(event) => {
            if (!layer.config) {
              layer.config = {};
            }
            layer.config.competitor = event.target.value;
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
        const competitors = myMiro.getModuleInfo(node.id).competitors;
        const value = competitors.find(
          (competitor) => competitor.completenessLevel,
        )?.completenessLevel;
        return value || 0;
      }),
    );

    const points: HeatmapPoint[] = filterNull(
      nodes.map((node) => {
        const info = myMiro.getModuleInfo(node.id);
        const ourCompletenessLevel = info.basicAttributes.completenessLevel;

        const competitors = info.competitors;
        const competitor = competitors.find(
          (competitor) => competitor.completenessLevel,
        );
        const competitorCompletenessLevel = competitor?.completenessLevel;
        if (!competitorCompletenessLevel) {
          return;
        }

        // ---

        const { x, y, width, height } = myMiro.getNodeRectInCanvas(node);

        if (!ourCompletenessLevel) {
          if (competitor.licenseType === LicenseType.PAID) {
            return {
              x,
              y,
              width,
              height,
              value: 1,
              color: '255, 215, 0',
            };
          }
          return {
            x,
            y,
            width,
            height,
            value: competitorCompletenessLevel / maxValue,
            color: '143, 0, 255',
          };
        }

        const diff = ourCompletenessLevel - competitorCompletenessLevel;
        const value = +diff / maxValue;
        return {
          x,
          y,
          width,
          height,
          value: Math.abs(value),
          color: diff >= 0 ? '50,205,50' : '255, 95, 21',
        } as HeatmapPoint;
      }),
    ) as never;

    return points;
  },
});
