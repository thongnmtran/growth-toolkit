/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, createSignal } from 'solid-js';
import KatalonIcon from './icons/KatalonIcon';
import { Box, Stack, styled } from '@suid/material';
import GrowthToolkitPanel, {
  GrowthToolkitPanelProps,
} from './growth-toolkit-panel/GrowthToolkitPanel';
import { DeepAnalyzer } from '@/services/DeepAnalyzer';
import { GPTService } from '@/services/GPTService';
import { Spinner, SpinnerType } from 'solid-spinner';
import LightButton from './LightButton';
import ChartPanel from './chart-panel/ChartPanel';
import PlayIcon from './icons/PlayIcon';
import { GPTAPIService } from '@/services/GPTAPIService';
import { getStore } from '@growth-toolkit/common-modules';
import {
  AnalysisModelFieldType,
  ModelNames,
} from '@growth-toolkit/common-models';
import { CompetitorAnalyzer } from '@/services/CompetitorAnalyzer';
import { exposeAPI } from '@/helpers/automator';

const decryptKey = (key: string) => {
  return atob(key).split(':')[1]!;
};
exposeAPI('decryptKey', decryptKey);

const encryptKey = (key: string) => {
  return btoa(`apiKey:${key}`);
};
exposeAPI('encryptKey', encryptKey);

const Toolbar = styled(Stack)({
  width: '50px',
  height: '50px',
  padding: '0px',
  margin: '0px 5px',
  marginLeft: '15px',
});

const keys = {
  myKey:
    'YXBpS2V5OnNrLWZUNktxRVBNWTJ0d2dmQjU4bXR2VDNCbGJrRkp2Vmk4UkRTMjBXVDRSYmF4SHo1bw',
  teamKey:
    'YXBpS2V5OnNrLVRIbXZMeVdDdXpDN2hFTXloWkhhVDNCbGJrRkp3aU1hNWVERDFVMURtaFZkdnljSg==',
};
const selectedKey = keys.myKey;

const gptKey = decryptKey(selectedKey);

interface GPTToolbarProps {}

const GPTToolbar: Component<GPTToolbarProps> = () => {
  const [openAnalyzerPanel, setOpenAnalyzerPanel] = createSignal(false);
  const [openChart, setOpenChart] = createSignal(false);
  const [currentAnalyzer, setCurrentAnalyzer] = createSignal<DeepAnalyzer>();
  const [currentAnalyzer2, setCurrentAnalyzer2] =
    createSignal<CompetitorAnalyzer>();
  const [analyzing, setAnalyzing] = createSignal(false);

  const handleOpen = () => {
    setOpenAnalyzerPanel(true);
  };

  const handleClose = () => {
    setOpenAnalyzerPanel(false);
  };

  const handleStartAnalyzingCompetitors: GrowthToolkitPanelProps['onStartAnalyzingCompetitors'] =
    (session, preview) => {
      setOpenAnalyzerPanel(false);
      currentAnalyzer2()?.stop();
      setOpenChart(true);

      if (!preview) {
        setAnalyzing(true);
      } else {
        setAnalyzing(false);
      }

      const apiGPTService = new GPTAPIService(gptKey);

      const gptService = session.useAPI ? apiGPTService : new GPTService();
      const analyzer = new CompetitorAnalyzer(session, gptService);
      analyzer.on('row-analyzed', ({ session }) => {
        getStore(ModelNames.CompetitorAnalysisSession).update({
          doc: session as never,
        });
      });

      setCurrentAnalyzer2(analyzer);

      if (!preview) {
        analyzer.start().finally(() => {
          console.log('> done');
          setAnalyzing(false);
        });
      }
    };

  const handleStartCategorizing: GrowthToolkitPanelProps['onStartCategorizing'] =
    (session, preview) => {
      setOpenAnalyzerPanel(false);
      currentAnalyzer()?.stop();
      setOpenChart(true);

      if (!preview) {
        setAnalyzing(true);
      } else {
        setAnalyzing(false);
      }

      const apiGPTService = new GPTAPIService(gptKey, session.assistantId);
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

      if (
        !preview ||
        session.model.fieldType === AnalysisModelFieldType.CATEGORIZED ||
        session.model.fieldType === AnalysisModelFieldType.RATING
      ) {
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
      analyzer.session.mode = 'analyze';
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

      <GrowthToolkitPanel
        open={openAnalyzerPanel()}
        onCancel={handleClose}
        onStartCategorizing={handleStartCategorizing}
        onStartAnalyzingCompetitors={handleStartAnalyzingCompetitors}
      />

      {!openAnalyzerPanel() && (
        <Box
          style={{
            width: openChart() ? '700px' : currentAnalyzer() ? '190px' : '72px',
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
            competitorAnalyzer={currentAnalyzer2()}
          />
        </Box>
      )}
    </Toolbar>
  );
};

export default GPTToolbar;
