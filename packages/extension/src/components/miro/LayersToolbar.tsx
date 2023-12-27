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
import Tooltip from '../common/Tooltip';
import LayersIcon from '../icons/LayersIcon';
import { For, createEffect, createSignal, onMount } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import { myMiro } from '@/helpers/MyMiro';
import { HeatmapPoint, drawHeatmap } from '@/helpers/canvas-utils';
import { filterNull } from '@growth-toolkit/common-utils';

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

const LayersToolbar = () => {
  const [expanded, setExpanded] = useCachedSignal(
    'layer-toolbar-expanded',
    false,
  );
  const [selectedLayers, setSelectedLayers] = createStore<string[]>([]);
  const [layerCanvas, setLayerCanvas] = createSignal<HTMLCanvasElement>();
  const [viewport, setViewport] = createSignal(0);

  const toggleExpanded = () => setExpanded(!expanded());

  const handleToggle = (layer: string) => (event: any) => {
    event.stopPropagation();
    event.preventDefault();
    setSelectedLayers(
      produce((draft) => {
        if (draft.includes(layer)) {
          draft.splice(draft.indexOf(layer), 1);
        } else {
          draft.push(layer);
        }
      }),
    );
  };

  const layers = [
    { name: '🔥 Heatmap', description: 'Where users use most' },
    { name: '😥 Losing Map', description: 'Where we lost the deals' },
    { name: '⚠ Risk Map', description: 'Where deals are at risk' },
    {
      name: '📄 Contrasting Map',
      description:
        'Where Ent users usage >< Free users usage (with the same age or the same experience)',
    },
    { name: '📉 Churning Map', description: 'Where churned users use most' },
    {
      name: '🩸 Bleeding Map',
      description: 'Where our money are leaking without a reasonable reason',
    },
  ];

  async function drawLayer() {
    console.log('> drawing heatmap');

    const canvas = myMiro.canvas;
    if (!canvas) {
      return;
    }

    const clone = canvas.cloneNode() as HTMLCanvasElement;
    clone.style.position = 'fixed';
    clone.style.top = '0';
    clone.style.left = '0';
    clone.style.zIndex = '9999';
    clone.style.pointerEvents = 'none';
    // clone.style.opacity = '0.5';
    clone.style.background = 'transparent';
    setLayerCanvas(clone);

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

    drawHeatmap({ canvas: clone, points });
  }

  createEffect(() => {
    viewport();
    const heatmapSelected = selectedLayers.some(
      (layer) => layer === layers[0]?.name,
    );
    if (heatmapSelected) {
      drawLayer();
    } else {
      setLayerCanvas(undefined);
    }
  });

  onMount(() => {
    myMiro.on('viewport-change', () => {
      setViewport(Math.random());
    });
  });

  return (
    <>
      {layerCanvas()}
      <Pivot>
        <Card elevation={3}>
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
                'max-height': expanded() ? '700px' : '0px',
                overflow: 'hidden',
                transition: 'all .14s ease-in-out',
              }}
            >
              <List dense>
                <For each={layers}>
                  {(layer) => (
                    <Tooltip title={layer.description}>
                      {(propz) => (
                        <ListItem dense disablePadding {...propz}>
                          <ListItemButton
                            dense
                            onClick={handleToggle(layer.name)}
                          >
                            <ListItemIcon>
                              <Checkbox
                                checked={selectedLayers.includes(layer.name)}
                              />
                            </ListItemIcon>
                            <ListItemText
                              id={layer.name}
                              primary={layer.name}
                            />
                          </ListItemButton>
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
