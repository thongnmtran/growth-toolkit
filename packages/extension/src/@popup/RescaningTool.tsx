/* eslint-disable solid/reactivity */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert, Box, Button, LinearProgress, Stack } from '@suid/material';
import { ChromeRuntimeTransport } from '@/transports/ChromeRuntimeTransport';
import { fetchGoogleSheet } from '@/utils/fetchGoogleFile';
import { NewRemoteObjectHelper } from '@growth-toolkit/common-transport';
import { PopupAPI } from './PopupAPI';
import { Fetcher } from '@/transports/Fetcher';
import { exposeAPI } from '@/helpers/automator';
import CTextField from '@/components/common/CTextField';
import { useCachedSignal } from '@/utils/useCachedSignal';
import { createMutable } from 'solid-js/store';
import { Component, For, createSignal } from 'solid-js';
import CopyIcon from '@/components/icons/CopyIcon';
import DownloadIcon from '@/components/icons/DownloadIcon';
import { downloadExcelFile } from '@/utils/downloadExcelFile';
import { copyExcelFile } from '@/utils/copyExcelFile';
import { humanizeSimilarwebInfo } from '@/competitor-scrapers/similarweb/humanizeSimilarwebInfo';
import { humanizeLinkedInInfo } from '@/competitor-scrapers/linkedin/humanizeLinkedInInfo';
import { ScraperManager, ScrapingJob } from './scrapers/ScraperManager';
import { WindowManager } from '../chrome-utils/WindowManager';
import { collectLinkedInInfo } from './scrapers/collectLinkedInInfo';
import { collectSimilarwebInfo } from './scrapers/collectSimilarwebInfo';
import { collectProductHuntInfo } from './scrapers/collectProductHuntInfo';
import CCheckbox from '@/components/common/CCheckbox';
import { collectG2Info } from './scrapers/collectG2Info';
import { humanizeCommonProductInfo } from '@/competitor-scrapers/common/humanizeCommonProductInfo';
import { unique } from '@growth-toolkit/common-utils';

// const leakers = {
//   cbInsights: 'https://www.cbinsights.com/company/testim/financials',
// };
interface RescaningToolProps {}

const RescaningTool: Component<RescaningToolProps> = () => {
  const [dataUrl, setDataUrl] = useCachedSignal(
    'data-url',
    'https://docs.google.com/spreadsheets/d/1wuDn1-dHaU9gwbGDIfDgoJCAVX-AAU1IXK8ovlP3kpU/edit#gid=707279259',
  );
  const [dataz, setData] = createSignal<any[]>([]);
  const [scraperManager, setScraperManager] =
    createSignal<ScraperManager | null>(null);
  const [enabledScrapers, setEnabledScrapers] = useCachedSignal('scrapers', [
    'LinkedIn',
    'Similarweb',
    'ProductHunt',
    'G2',
  ]);

  const progress = createMutable({
    total: 0,
    running: false,
    phase: '',
  });
  const [error, setError] = createSignal('');

  const bgTransport = new ChromeRuntimeTransport(chrome.runtime.id, 'popup');
  bgTransport.connect();
  const api = NewRemoteObjectHelper.wrapClient(
    {} as PopupAPI,
    bgTransport,
    'popup-scraper',
  );
  exposeAPI('api', api);

  const scrapers: Record<string, ScrapingJob> = {
    linkedIn: {
      name: 'LinkedIn',
      handler: async ({ row, tabId }) => {
        const linkedInInfo = await collectLinkedInInfo({
          row,
          api,
          tabId,
        });
        Object.assign(row, humanizeLinkedInInfo(linkedInInfo));
      },
      onProgress: ({ current, row, name }) => {
        progress.phase = `Collecting data from LinkedIn for "${row['Company']}"...`;
        (progress as any)[name] = current;
      },
    },
    Similarweb: {
      name: 'Similarweb',
      handler: async ({ row, tabId }) => {
        const simiarwebInfo = await collectSimilarwebInfo({
          row,
          api,
          tabId,
        });
        Object.assign(
          row,
          simiarwebInfo ? humanizeSimilarwebInfo(simiarwebInfo) : {},
        );
      },
      onProgress: ({ current, row, name }) => {
        progress.phase = `Collecting data from Similarweb for "${row['Company']}"...`;
        (progress as any)[name] = current;
      },
    },
    ProductHunt: {
      name: 'ProductHunt',
      handler: async ({ row, tabId, name }) => {
        const info = await collectProductHuntInfo({
          row,
          api,
          tabId,
        });
        Object.assign(row, info ? humanizeCommonProductInfo(info, name) : {});
      },
      onProgress: ({ current, row, name }) => {
        progress.phase = `Collecting data from ProductHunt for "${row['Company']}"...`;
        (progress as any)[name] = current;
      },
    },
    G2: {
      name: 'G2',
      handler: async ({ row, tabId, name }) => {
        const info = await collectG2Info({
          row,
          api,
          tabId,
        });
        Object.assign(row, info ? humanizeCommonProductInfo(info, name) : {});
      },
      onProgress: ({ current, row, name }) => {
        progress.phase = `Collecting data from G2 for "${row['Company']}"...`;
        (progress as any)[name] = current;
      },
    },
  };

  const handleScrapeCompetitors = async () => {
    progress.running = true;
    progress.total = 0;
    Object.values(scrapers).forEach((scraper) => {
      (progress as any)[scraper.name] = 0;
    });

    const scraperManager = new ScraperManager();
    setScraperManager(scraperManager);

    progress.phase = 'Fetching data...';
    const excel = await fetchGoogleSheet(dataUrl(), new Fetcher());
    console.log('> Data:', excel);
    setData(excel.rows);
    const rows = excel.rows.slice(0);
    scraperManager.rows = rows;
    progress.total = rows.length;

    const windowManager = new WindowManager();
    scraperManager.tabProvider = async () => {
      return (await windowManager.newTab()).id!;
    };

    Object.values(scrapers).forEach((scraper) => {
      if (enabledScrapers().includes(scraper.name)) {
        scraperManager.schedule(scraper);
      }
    });

    await scraperManager.run();

    progress.running = false;
    progress.phase = `Done! You can now export the data.`;

    await windowManager.closeAll();
  };

  const start = async () => {
    try {
      await handleScrapeCompetitors();
    } catch (error) {
      progress.running = false;
      setError((error as any).message);
      throw error;
    }
  };

  const stop = () => {
    if (!window.confirm('Are you sure you want to stop?')) {
      return;
    }
    scraperManager()?.stop();
    progress.running = false;
  };

  const downloadCSV = () => {
    downloadExcelFile(dataz(), 'competitors.csv');
  };

  const copyCSV = () => {
    copyExcelFile(dataz());
  };

  return (
    <>
      <Stack spacing={1} mt={2}>
        <Alert severity="info">
          The data file should contain these columns: <b>"Company"</b> for
          LinkedIn, <b>"Domain"</b> for Similarweb, and <b>"Name"</b> for
          peer-review sites.
        </Alert>
        <CTextField
          label="Data URL"
          value={dataUrl()}
          onChange={(event) => setDataUrl(event.target.value)}
          fullWidth
        />

        <hr />

        {!progress.running ? (
          <Button variant="contained" size="small" onClick={start} fullWidth>
            Start
          </Button>
        ) : (
          <Button
            variant="outlined"
            size="small"
            onClick={stop}
            fullWidth
            color="warning"
          >
            Stop
          </Button>
        )}

        <For each={Object.values(scrapers)}>
          {(scraper) => (
            <Stack direction={'row'} spacing={1} alignItems="center">
              <Box>
                <CCheckbox
                  label={scraper.name}
                  checked={enabledScrapers().includes(scraper.name)}
                  disabled={progress.running}
                  onChange={(_event, checked) => {
                    setEnabledScrapers((prev) => {
                      return checked
                        ? unique([...prev, scraper.name])
                        : prev.filter((name) => name !== scraper.name);
                    });
                  }}
                  sx={{ paddingTop: 0, paddingBottom: 0 }}
                />
                {(progress as any)[scraper.name] || 0}/{progress.total}
              </Box>
              <LinearProgress
                variant={
                  progress.running &&
                  enabledScrapers().includes(scraper.name) &&
                  !(progress as any)[scraper.name]
                    ? 'indeterminate'
                    : 'determinate'
                }
                value={((progress as any)[scraper.name] / progress.total) * 100}
                sx={{ flexGrow: 1 }}
              />
            </Stack>
          )}
        </For>

        {progress.phase && !error() && (
          <Alert severity="info">{progress.phase}</Alert>
        )}
        {error() && <Alert severity="error">{error()}</Alert>}

        <hr />

        <Stack direction={'row'} spacing={1}>
          <Button
            variant="contained"
            size="small"
            onClick={downloadCSV}
            fullWidth
            startIcon={<DownloadIcon width={24} height={24} />}
            disabled={dataz().length === 0}
          >
            Download CSV
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={copyCSV}
            fullWidth
            startIcon={<CopyIcon width={24} height={24} />}
            disabled={dataz().length === 0}
          >
            Copy CSV
          </Button>
        </Stack>
      </Stack>
    </>
  );
};

export default RescaningTool;
