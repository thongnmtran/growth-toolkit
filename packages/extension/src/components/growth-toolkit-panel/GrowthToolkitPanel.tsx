/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
} from '@suid/material';
import { DialogProps } from '@suid/material/Dialog';
import CategorizerTab, { CategorizerProps } from './categorizer/CategorizerTab';
import { For, Show, createMemo } from 'solid-js';
import { useCachedSignal } from '@/utils/useCachedSignal';
import CompetitorModelTab from './competitor-model/CompetitorModelTab';
import CompetitorAnalysisTab, {
  CompetitorAnalysisTabProps,
} from './competitor-analysis/CompetitorAnalysisTab';

export interface GrowthToolkitPanelProps extends DialogProps {
  onStartCategorizing: CategorizerProps['onStartCategorizing'];
  onStartAnalyzingCompetitors: CompetitorAnalysisTabProps['onStartAnalyzingCompetitors'];
  onCancel?: () => void;
}

const GrowthToolkitPanel = (props: GrowthToolkitPanelProps) => {
  const tabs = createMemo(() =>
    Object.entries({
      Categorizer: (
        <CategorizerTab
          onStartCategorizing={props.onStartCategorizing}
          onCancel={props.onCancel}
        />
      ),
      'Competitor Model': <CompetitorModelTab onCancel={props.onCancel} />,
      'Competitor Analysis': (
        <CompetitorAnalysisTab
          onStartAnalyzingCompetitors={props.onStartAnalyzingCompetitors}
          onCancel={props.onCancel}
        />
      ),
    }),
  );
  const [tab, setTab] = useCachedSignal<string>('working-tab', 'Categorizer');

  return (
    <Dialog
      {...props}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="xl"
      onClose={props.onCancel}
      sx={{
        minWidth: '810px',
        minHeight: '650px',
      }}
    >
      <DialogTitle>{'Growth Toolkit'}</DialogTitle>
      <DialogContent
        sx={{
          overflow: 'hidden',
          paddingTop: 0,
          paddingBottom: 0,
          minHeight: '40px',
        }}
      >
        <Stack direction={'row'}>
          <For each={tabs()}>
            {([tabKey]) => (
              <Button
                onClick={() => setTab(tabKey as never)}
                variant={tab() === tabKey ? 'contained' : 'text'}
              >
                {tabKey}
              </Button>
            )}
          </For>
        </Stack>
      </DialogContent>
      <For each={tabs()}>
        {([tabKey, tabContent]) => (
          <Show when={tab() === tabKey}>{tabContent}</Show>
        )}
      </For>
    </Dialog>
  );
};

export default GrowthToolkitPanel;
