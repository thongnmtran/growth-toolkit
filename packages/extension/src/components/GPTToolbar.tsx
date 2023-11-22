import { Component, createSignal } from 'solid-js';
import KatalonIcon from './icons/KatalonIcon';
import { Box, Stack, styled } from '@suid/material';
import AnalyzerPanel, {
  AnalyzerPanelProps,
} from './analysis-panel/AnalyzerPanel';
import { DeepAnalyzer } from '@/services/DeepAnalyzer';
import { GPTService } from '@/services/GPTService';
import { Spinner, SpinnerType } from 'solid-spinner';
import LightButton from './LightButton';
import ChartPanel from './ChartPanel';
import PlayIcon from './icons/PlayIcon';
import { GPTAPIService } from '@/services/GPTAPIService';
import { getStore } from '@growth-toolkit/common-modules';
import { ModelNames } from '@growth-toolkit/common-models';
import { useCachedSignal } from '@/helpers/useCachedSignal';

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
  const [openChart, setOpenChart] = useCachedSignal('openChart', false);
  const [currentAnalyzer, setCurrentAnalyzer] = createSignal<DeepAnalyzer>();
  const [analyzing, setAnalyzing] = createSignal(false);

  const handleOpen = () => {
    setOpenAnalyzerPanel(true);
  };

  const handleClose = () => {
    setOpenAnalyzerPanel(false);
  };

  const handleStart: AnalyzerPanelProps['onOK'] = (session, preview) => {
    setOpenAnalyzerPanel(false);
    setOpenChart(true);
    currentAnalyzer()?.stop();

    if (!preview) {
      setAnalyzing(true);
    } else {
      setAnalyzing(false);
    }

    const apiGPTService = new GPTAPIService(
      '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',
      session.assistantId,
    );
    apiGPTService.onAssistantIdChange = (assistantId) => {
      session.assistantId = assistantId;
      getStore(ModelNames.AnalysisSession).update({ doc: session });
    };

    const gptService = session.useAPI ? apiGPTService : new GPTService();
    const analyzer = new DeepAnalyzer(session, gptService);
    analyzer.on('row-analyzed', ({ session }) => {
      getStore(ModelNames.AnalysisSession).update({ doc: session });
    });

    setCurrentAnalyzer(analyzer);

    if (!preview || session.model.isCategorizedField) {
      analyzer.start().finally(() => {
        setAnalyzing(false);
      });
    }
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
      analyzer.sesion.mode = 'analyze';
      analyzer.start().finally(() => {
        setAnalyzing(false);
      });
    }
  };

  return (
    <Toolbar direction={'row'} spacing={3.5} alignItems="center">
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
            width: openChart() ? '700px' : currentAnalyzer() ? '350px' : '72px',
            position: 'fixed',
            top: '68px',
            right: '14px',
            'z-index': '9999',
            transition: 'all .3s ease-in-out',
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
