import CSelect from '@/components/common/CSelect';
import { RawUIInsightLayer } from '../insight-layer-types';
import { Stack } from '@suid/material';
import { HeatmapPoint } from '@/helpers/canvas-utils';
import { Competitor, LicenseType } from '@/models/ModuleInfo';
import { myMiro } from '@/helpers/MyMiro';
import { filterNull } from '@growth-toolkit/common-utils';
import { Accessor } from 'solid-js';

export type CompetitorMapLayerConfig = {
  competitor: string;
};

export type CompetitorMapLayer = RawUIInsightLayer<CompetitorMapLayerConfig>;

export const competitorMap: (
  competitors: Accessor<Competitor[]>,
) => CompetitorMapLayer = (competitors) => ({
  color: '255, 95, 21',
  config: {
    competitor: 'All',
  },
  configComponent: (layer: RawUIInsightLayer) => {
    return (
      <Stack spacing={2}>
        <CSelect
          label="Target Competitor"
          options={[
            'All',
            ...competitors().map((competitor) => competitor.name),
          ]}
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
  pointsProvider: async (layer) => {
    const { competitor: targetCompetitor } = layer.config || {};

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
          (competitor) =>
            (!targetCompetitor ||
              targetCompetitor === 'All' ||
              competitor.name === targetCompetitor) &&
            competitor.completenessLevel,
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
