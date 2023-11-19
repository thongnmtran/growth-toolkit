import { AnalysisModelDoc, ModelNames } from '@growth-toolkit/common-models';
import { getStore } from '@growth-toolkit/common-modules';
import { Box, Card, Stack } from '@suid/material';
import { Component, For, createSignal, onMount } from 'solid-js';

interface AnalysisListProps {
  onSelect: (analysis: AnalysisModelDoc) => void;
}

const AnalysisList: Component<AnalysisListProps> = (props) => {
  const [analysisModels, setAnalysisModels] = createSignal<AnalysisModelDoc[]>(
    [],
  );

  const store = getStore(ModelNames.AnalysisModel);

  onMount(async () => {
    const cachedModels = await store.findMany({ query: {} });
    setAnalysisModels(cachedModels);
  });

  return (
    <Stack>
      <For each={analysisModels()}>
        {(model) => (
          <Box>
            <Card onClick={() => props.onSelect?.(model)}>
              <Box>{model.name}</Box>
            </Card>
          </Box>
        )}
      </For>
    </Stack>
  );
};

export default AnalysisList;
