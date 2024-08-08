/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Card,
  Checkbox,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  styled,
} from '@suid/material';
import { useCachedSignal } from '@/utils/useCachedSignal';
import Tooltip from '../../common/Tooltip';
import LayersIcon from '../../icons/LayersIcon';
import {
  Component,
  For,
  createEffect,
  createMemo,
  createSignal,
  onMount,
} from 'solid-js';
import { createMutable, unwrap } from 'solid-js/store';
import { myMiro } from '@/helpers/MyMiro';
import { drawHeatmap } from '@/helpers/canvas-utils';
import { Competitor } from '@/models/ModuleInfo';
import { Collapse } from 'solid-collapse';
import { RawUIInsightLayer, InsightLayerMap } from './insight-layer-types';
import { heatmapLayer } from './layers/HeatmapLayer';
import { cloneCanvas } from './insight-layer-utils';
import { competitorMap } from './layers/CompetitorMap';
import { Portal } from 'solid-js/web';
import { monetarizeMap } from './layers/MonetarizeMap';
import { InsightLayerName, insightLayers } from './insightLayers';

const Pivot = styled(Box)({
  position: 'fixed',
  top: '129px',
  right: '8px',
});

const Container = styled(Stack)({});

const ToolbarButton = styled(IconButton)({
  width: '40px',
  height: '40px',
});

const Header = styled(Stack)({
  height: '40px',
});

export interface LayersToolbarProps {}

const LayersToolbar: Component<LayersToolbarProps> = () => {
  const [expanded, setExpanded] = useCachedSignal(
    'layer-toolbar-expanded',
    false,
  );
  const [competitors] = createSignal<Competitor[]>(myMiro.config.competitors);
  const [viewport, setViewport] = createSignal(0);
  const [canvasBox, setCanvasBox] = createSignal<Element>();

  const toggleExpanded = () => setExpanded(!expanded());

  const handleToggle = (layer: RawUIInsightLayer) => () => {
    layer.selected = !layer.selected;
    if (!layer.selected) {
      layer.canvas = undefined;
    }
  };

  const layers = createMemo(() => {
    return Object.entries({
      competitorMap: competitorMap(competitors),
      monetarizeMap: monetarizeMap(),
      churningMap: {
        color: 'blue',
      },
      losingMap: {
        color: 'orange',
      },
      bleedingMap: {
        color: 'orange',
      },
      heatmap: heatmapLayer(),
      qualityMap: {
        color: 'green',
      },
      satisfactionMap: {
        color: 'pink',
      },
      riskMap: {
        color: 'orange',
      },
    } as InsightLayerMap).map(([key, layer]) => {
      const rawLayer = insightLayers[key as InsightLayerName];
      return createMutable({
        ...rawLayer,
        ...layer,
      });
    });
  });

  async function drawLayer(layer: RawUIInsightLayer) {
    layer.canvas = cloneCanvas();
    const points = (await layer.pointsProvider?.(layer)) || [];
    drawHeatmap({ canvas: unwrap(layer).canvas!, points, color: layer.color });
  }

  createEffect(() => {
    viewport();
    layers()
      .filter((layerI) => layerI.selected)
      .forEach((layer) => {
        drawLayer(layer);
      });
  });

  onMount(() => {
    myMiro.on('viewport-change', () => {
      setViewport(Math.random());
    });
    const canvasBox = document.createElement('div');
    myMiro.canvas.parentNode?.appendChild(canvasBox);
    setCanvasBox(canvasBox);
  });

  return (
    <>
      <Portal mount={canvasBox()}>
        <For each={layers()}>
          {(layer) => <>{layer.selected && layer.canvas}</>}
        </For>
      </Portal>

      <Pivot>
        <Card
          elevation={3}
          no-prevent-default="true"
          data-scrollable-element="true"
        >
          <Container p={1}>
            <Header direction={'row'} justifyContent="space-between">
              <Box>
                {expanded() && (
                  <Box
                    fontSize={'1rem'}
                    fontWeight={'bold'}
                    alignItems="center"
                    displayRaw="flex"
                    height={'100%'}
                  >
                    Insight Layers
                  </Box>
                )}
              </Box>
              <Stack direction={'row'} spacing={1}>
                <Tooltip title="Insight Layers">
                  {(propz) => (
                    <ToolbarButton onClick={toggleExpanded} {...propz}>
                      <LayersIcon />
                    </ToolbarButton>
                  )}
                </Tooltip>
              </Stack>
            </Header>

            <Box
              style={{
                width: expanded() ? '300px' : '0px',
                'max-height': expanded() ? '500px' : '0px',
                overflow: 'auto',
                transition: 'all .14s ease-in-out',
              }}
              no-prevent-default="true"
              data-scrollable-element="true"
            >
              <List dense sx={{ overflow: 'auto' }}>
                <For each={layers()}>
                  {(layer) => (
                    <Tooltip title={layer.description}>
                      {(propz) => (
                        <ListItem
                          dense
                          disablePadding
                          {...propz}
                          sx={{ flexWrap: 'wrap' }}
                        >
                          <ListItemButton
                            dense
                            onClick={handleToggle(layer)}
                            selected={!!layer.selected}
                          >
                            <ListItemIcon>
                              <Checkbox checked={!!layer.selected} />
                            </ListItemIcon>
                            <ListItemText
                              id={layer.name}
                              primary={layer.name}
                            />
                          </ListItemButton>
                          <Box
                            sx={{
                              boxShadow: 'inset 0 0 3px gray',
                              width: '100%',
                              borderRadius: '0 0 8px 8px',
                            }}
                          >
                            <Collapse
                              value={
                                !!layer.selected && !!layer.configComponent
                              }
                            >
                              <Box p={1}>
                                {layer.selected &&
                                  layer.configComponent &&
                                  layer.configComponent(layer as never)}
                              </Box>
                            </Collapse>
                          </Box>
                        </ListItem>
                      )}
                    </Tooltip>
                  )}
                </For>
              </List>
            </Box>
          </Container>
        </Card>
      </Pivot>
    </>
  );
};

export default LayersToolbar;
