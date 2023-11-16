import { Component, createSignal } from 'solid-js';
import KatalonIcon from './icons/KatalonIcon';
import { Box, Stack, styled } from '@suid/material';
import AnalyzerPanel, { AnalyzerPanelProps } from './AnalyzerPanel';
import { DeepAnalyzer } from '@/services/DeepAnalyzer';
import { GPTService } from '@/services/GPTService';
import { Spinner, SpinnerType } from 'solid-spinner';
import LightButton from './LightButton';
import ChartPanel from './ChartPanel';
import PlayIcon from './icons/PlayIcon';

const Toolbar = styled(Stack)({
  width: '50px',
  height: '50px',
  padding: '0px',
  margin: '0px 5px',
  marginLeft: '15px',
});

interface GPTToolbarProps {}

const GPTToolbar: Component<GPTToolbarProps> = () => {
  const [openAnalyzerPanel, setOpenAnalyzerPanel] = createSignal(false);
  const [openChart, setOpenChart] = createSignal(true);
  const [currentAnalyzer, setCurrentAnalyzer] = createSignal<DeepAnalyzer>();
  const [analyzing, setAnalyzing] = createSignal(false);

  const handleOpen = () => {
    setOpenAnalyzerPanel(true);
  };

  const handleClose = () => {
    setOpenAnalyzerPanel(false);
  };

  const handleStart: AnalyzerPanelProps['onOK'] = (model) => {
    setOpenAnalyzerPanel(false);
    currentAnalyzer()?.stop();
    setAnalyzing(true);
    const analyzer = new DeepAnalyzer(model, new GPTService());
    setCurrentAnalyzer(analyzer);
    analyzer.start().finally(() => {
      setAnalyzing(false);
    });
  };

  const handlePauseResume = () => {
    const analyzer = currentAnalyzer();
    if (!analyzer) {
      return;
    }
    if (analyzing()) {
      analyzer.stop();
    } else {
      setAnalyzing(true);
      analyzer.model.mode = 'analyze';
      analyzer.start().finally(() => {
        setAnalyzing(false);
      });
    }
  };

  return (
    <Toolbar direction={'row'} spacing={1} alignItems="center">
      <LightButton onClick={handleOpen}>
        <KatalonIcon />
      </LightButton>

      {currentAnalyzer() && (
        <LightButton onClick={handlePauseResume}>
          {analyzing() ? (
            <Spinner
              type={SpinnerType.circles}
              width={'100%'}
              height={'100%'}
            />
          ) : (
            <PlayIcon />
          )}
        </LightButton>
      )}

      <AnalyzerPanel
        open={openAnalyzerPanel()}
        onCancel={handleClose}
        onOK={handleStart}
      />

      {!openAnalyzerPanel() && (
        <Box
          style={{
            width: '1200px',
            position: 'fixed',
            top: '68px',
            right: '14px',
            'z-index': '9999',
          }}
        >
          <ChartPanel
            open={openChart()}
            onOpenChange={setOpenChart}
            analyzer={currentAnalyzer()}
          />
        </Box>
      )}
    </Toolbar>
  );
};

export default GPTToolbar;