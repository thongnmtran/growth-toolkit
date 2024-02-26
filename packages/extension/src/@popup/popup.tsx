/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Stack, ToggleButton, ToggleButtonGroup } from '@suid/material';
import { render } from 'solid-js/web';
import { useCachedSignal } from '@/utils/useCachedSignal';
import RescaningTool from './RescaningTool';
import { SavedSearchRounded, FindReplaceRounded } from '@suid/icons-material';
import CompetitorFinder from './CompetitorFinder';

const tabs = {
  finder: 'finder',
  rescaning: 'rescaning',
};

const App = () => {
  const [tab, setTab] = useCachedSignal('tab', tabs.rescaning);

  return (
    <>
      <Stack spacing={1} mt={2}>
        <ToggleButtonGroup
          value={tab()}
          exclusive
          onChange={(_event, newAlignment) => {
            setTab(newAlignment);
          }}
          aria-label="text alignment"
        >
          <ToggleButton value={tabs.rescaning}>
            <FindReplaceRounded />
          </ToggleButton>
          <ToggleButton value={tabs.finder}>
            <SavedSearchRounded />
          </ToggleButton>
        </ToggleButtonGroup>
        <Box>{tab() === tabs.rescaning && <RescaningTool />}</Box>
        <Box>{tab() === tabs.finder && <CompetitorFinder />}</Box>
      </Stack>
    </>
  );
};

render(() => <App />, document.body);
