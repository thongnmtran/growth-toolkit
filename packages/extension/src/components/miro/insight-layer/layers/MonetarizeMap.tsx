import { RawUIInsightLayer } from '../insight-layer-types';

export type MonetarizeMapLayerConfig = {
  //
};

export type MonetarizeMapLayer = RawUIInsightLayer<MonetarizeMapLayerConfig>;

export const monetarizeMap: () => MonetarizeMapLayer = () => ({
  color: '255, 95, 21',
  // pointsProvider: async (layer) => {
  //   const nodes = await myMiro.getModuleNodes();
  //   const points = nodes.map((node) => node);
  // },
});
