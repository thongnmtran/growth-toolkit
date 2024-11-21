/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable solid/no-innerhtml */
import { Box, Button, Card, IconButton, Stack, styled } from '@suid/material';
import KatalonIcon from '../icons/KatalonIcon';
import { useCachedSignal } from '@/utils/useCachedSignal';
import { onChangeFromSetter } from '@/helpers/solidjs-utils';
import { RawSegmentFilter, myMiro } from '@/helpers/MyMiro';
import AdjustStyleIcon from '../icons/AdjustSizeIcon';
import Tooltip from '../common/Tooltip';
import { Portal } from 'solid-js/web';
import { createSignal, onMount } from 'solid-js';
import { findElement } from '@/helpers/automator';
import { Shape } from '@mirohq/websdk-types';
import DynamicToolTip from '../common/DynamicToolTip';
import NodePropertiesDialog from './NodePropertiesDialog';
import CTextField from '../common/CTextField';
import { HoveringNode } from '@/models/HoveringNode';
import { createMutable } from 'solid-js/store';
import RefreshIcon from '../icons/RefreshIcon';
import DownloadIcon from '../icons/DownloadIcon';
import { Competitor } from '@/models/ModuleInfo';
import UploadIcon from '../icons/UploadIcon';
import ExportDialog from './ExportDialog';

const Pivot = styled(Box)({
  position: 'fixed',
  top: '65px',
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

const MiroToolbar = () => {
  const [script, setScript] = useCachedSignal('script', '');
  const [expanded, setExpanded] = useCachedSignal(
    'main-toolbar-expanded',
    false,
  );
  const [shapeAnchor, setShapeAnchor] = createSignal<HTMLElement>();
  const [hoveringNode, setHoveringNode] = createSignal<HoveringNode>();
  const [editingNode, setEditingNode] = createSignal<Shape>();
  const [segments, setSegments] = createSignal<RawSegmentFilter[]>([]);
  const [competitors, setCompetitors] = createSignal<Competitor[]>([]);
  const [exporting, setExporting] = createSignal(false);
  const [importing, setImporting] = createSignal(false);

  const handleOpen = async () => {
    setEditingNode((await myMiro.getSelectedNode()) as never);
  };

  const handleClose = () => {
    setEditingNode();
  };

  const openExportPanel = () => {
    setExporting(true);
  };

  const closeExportPanel = () => {
    setExporting(false);
  };

  const openImportPanel = () => {
    setImporting(true);
  };

  const closeImportPanel = () => {
    setImporting(false);
  };

  const toggleExpanded = () => setExpanded(!expanded());

  const overwriteStyles = async () => {
    await myMiro.adjustStyles();
  };

  const syncStyles = async () => {
    if ((await myMiro.getSelection()).length > 0) {
      await myMiro.syncStyles();
    } else {
      await myMiro.adjustStyles(true);
    }
  };

  const test = async () => {
    myMiro.eval(script());
  };

  const detailsButtonID = 'growth-toolkit-node-data';
  onMount(() => {
    myMiro.on('node-enter', async ({ node, rect }) => {
      if (node.type !== 'shape') {
        return;
      }

      const info = myMiro.getModuleInfo(node) || {};
      const hoveringNode: HoveringNode = createMutable({
        node,
        rect,
        info,
      });
      setHoveringNode(hoveringNode);
    });

    myMiro.on('node-leave', () => {
      setHoveringNode(undefined);
    });

    setSegments(myMiro.config.segments);
    setCompetitors(myMiro.config.competitors);
    myMiro.on('ready', () => {
      console.log('ready', myMiro.config);
      setSegments(myMiro.config.segments);
      setCompetitors(myMiro.config.competitors);
    });

    const observer = new MutationObserver(() => {
      const anchor = findElement(
        '[data-testid="horizontal-context-menu"] [role="separator"]:nth-last-of-type(2)',
      );
      if (anchor) {
        const existingRoot = document.getElementById(detailsButtonID);
        if (existingRoot) {
          return;
        }
        const placeholder = document.createElement('div');
        setShapeAnchor(placeholder);
        anchor.parentNode?.insertBefore(placeholder, anchor);
      }
    });

    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    });
  });

  const validHovering = () =>
    !!(
      hoveringNode()?.node &&
      hoveringNode()?.rect &&
      (hoveringNode()?.info?.id ||
        hoveringNode()?.info?.description ||
        hoveringNode()?.info?.whenToUse)
    );

  return (
    <>
      {shapeAnchor() && (
        <Portal mount={shapeAnchor()}>
          <Tooltip title="Details">
            {(propz) => (
              <Box
                width={40}
                height={50}
                paddingLeft={'5px'}
                borderLeft={'1px solid #e6e6e6'}
                displayRaw="flex"
                justifyContent="center"
                alignItems="center"
                style={{ 'user-select': 'none' }}
                {...propz}
              >
                <ToolbarButton id={detailsButtonID} onClick={handleOpen}>
                  <KatalonIcon />
                </ToolbarButton>
              </Box>
            )}
          </Tooltip>
        </Portal>
      )}

      <DynamicToolTip
        open={validHovering()}
        x={hoveringNode()?.rect?.x}
        y={hoveringNode()?.rect?.y}
        anchorWidth={hoveringNode()?.rect?.width}
        html={
          validHovering()
            ? `<style>p { margin: 0; }</style>
                ${
                  hoveringNode()?.info?.id
                    ? `<div>#${hoveringNode()?.info?.id}</div>`
                    : ''
                }
                <div>${hoveringNode()?.node?.content}</div>
                <div style="white-space: pre-wrap;">${hoveringNode()?.info
                  ?.description}</div>
                <div>${hoveringNode()?.info?.whenToUse}</div>`
            : ''
        }
      />

      <NodePropertiesDialog
        open={!!editingNode()}
        node={editingNode()}
        onCancel={handleClose}
        segments={segments()}
        competitors={competitors()}
      />

      <ExportDialog open={exporting()} onClose={closeExportPanel} />

      <Pivot>
        <Card elevation={3}>
          <Container p={1}>
            <Header direction={'row'} justifyContent="space-between">
              <Box>
                {expanded() && (
                  <Box
                    fontSize={'1.4rem'}
                    fontWeight={'bold'}
                    alignItems="center"
                    displayRaw="flex"
                  >
                    Growth Toolkit
                  </Box>
                )}
              </Box>
              <Stack direction={'row'} spacing={1}>
                <Tooltip title="Import Data">
                  {(propz) => (
                    <ToolbarButton onClick={openImportPanel} {...propz}>
                      <UploadIcon />
                    </ToolbarButton>
                  )}
                </Tooltip>
                <Tooltip title="Export Data">
                  {(propz) => (
                    <ToolbarButton onClick={openExportPanel} {...propz}>
                      <DownloadIcon />
                    </ToolbarButton>
                  )}
                </Tooltip>
                <Tooltip title="Sync Styles">
                  {(propz) => (
                    <ToolbarButton onClick={syncStyles} {...propz}>
                      <RefreshIcon />
                    </ToolbarButton>
                  )}
                </Tooltip>
                <Tooltip title="Overwrite Styles">
                  {(propz) => (
                    <ToolbarButton onClick={overwriteStyles} {...propz}>
                      <AdjustStyleIcon />
                    </ToolbarButton>
                  )}
                </Tooltip>
                <Tooltip title="Growth Toolkit">
                  {(propz) => (
                    <ToolbarButton onClick={toggleExpanded} {...propz}>
                      <KatalonIcon />
                    </ToolbarButton>
                  )}
                </Tooltip>
              </Stack>
            </Header>

            <Box
              style={{
                width: expanded() ? '700px' : '0px',
                'max-height': expanded() ? '700px' : '0px',
                overflow: 'hidden',
                transition: 'all .3s ease-in-out',
              }}
            >
              <Stack width={700} mt={1} spacing={1}>
                <CTextField
                  value={script()}
                  onChange={onChangeFromSetter(setScript)}
                  fullWidth
                  multiline
                  rows={14}
                />
                <Button onClick={test} variant="contained">
                  Test
                </Button>
              </Stack>
            </Box>
          </Container>
        </Card>
      </Pivot>
    </>
  );
};

export default MiroToolbar;
