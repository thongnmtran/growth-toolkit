import { Button, Stack } from '@suid/material';
import { render } from 'solid-js/web';
import { createSignal } from 'solid-js';
import { findElements } from '@/helpers/automator';

const leakers = {
  cbInsights: 'https://www.cbinsights.com/company/testim/financials',
};

const App = () => {
  const [competitors, setCompetitors] = createSignal<Competitor[]>([]);

  const handleScrapeCompetitors = async () => {
    const competitorFinders = {
      chatGPT: async () => {
        return [];
      },
      productHunt: async () => {
        open('https://www.producthunt.com/categories/testing-and-qa');
        const competitors: Competitor = [];

        const productNodes = findElements('');

        return competitors;
      },
    } satisfies Record<string, () => Promise<Competitor[]>>;

    const foundCompetitors = (
      await Promise.all(
        Object.values(competitorFinders).map((finder) => finder()),
      )
    ).flat();

    console.log(foundCompetitors);
  };

  return (
    <>
      <Stack spacing={1} sx={{ width: '400px', height: '300px' }}>
        <Button
          variant="contained"
          size="small"
          onClick={handleScrapeCompetitors}
        >
          Scrape Competitors
        </Button>
      </Stack>
    </>
  );
};

render(() => <App />, document.body);
