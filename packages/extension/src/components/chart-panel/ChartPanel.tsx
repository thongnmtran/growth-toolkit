/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Component,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js';
import * as echarts from 'echarts';
import { Box, Button, Card, Stack, styled } from '@suid/material';
import CollapseIcon from '../icons/CollapseIcon';
import { Collapse } from 'solid-collapse';
import ExpandIcon from '../icons/ExpandIcon';
import {
  AnalyzingProgressEvent,
  AnalyzingStatistics,
  DeepAnalyzer,
} from '@/services/DeepAnalyzer';
import DownloadIcon from '../icons/DownloadIcon';
import { downloadExcelFile } from '@/utils/downloadExcelFile';
import DownloadImageIcon from '../icons/DownloadImageIcon';
import { copyExcelFile } from '@/utils/copyExcelFile';
import Tooltip from '../common/Tooltip';
import { ChartData } from './chart-types';
import { buildHotPieChartOption } from './buildHotPieChartOptions';
import { buildBarChartOption } from './buildBarChartOptions';
import CreativeIcon from '../icons/CreativeIcon';
import { useCachedSignal } from '@/utils/useCachedSignal';
import { buildBarChartOptions2 } from './buildBarChartOption2';

const chartProviders = [
  buildBarChartOption,
  buildBarChartOptions2,
  buildHotPieChartOption,
];

const Container = styled(Card)({
  background: 'rgba(255,255,255,.05)',
  // backdropFilter: 'blur(.5px)',

  '&:hover .chart-container, &:hover .chart-toolbar': {
    opacity: '1',
  },

  '& .chart-wrapper': {
    width: '100%',
    height: '300px',
    transition: 'height 300ms cubic-bezier(0.65, 0, 0.35, 1);',
  },
});

const Toolbar = styled(Box)({
  background:
    '#fff linear-gradient(58.2deg, rgba(40, 91, 212, 0.73) -3%, rgba(171, 53, 163, 0.45) 49.3%, rgba(255, 204, 112, 0.37) 97.7%)',
  borderRadius: '6px 6px 0px 0px',
  opacity: '.7',
});

const ChartContainer = styled(Box)({
  opacity: '.5',
  transition: 'opacity .3s ease-in-out',
});

interface ChartPanelProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  analyzer?: DeepAnalyzer;
}

const ChartPanel: Component<ChartPanelProps> = (props) => {
  const [open, setOpen] = createSignal(false);
  const [statistics, setStatistics] = createSignal<AnalyzingStatistics>();
  const [favoriteChart, setFavoriteChart] = useCachedSignal('favoriteChart', 0);

  let chartElement: HTMLElement;
  let myChart: echarts.ECharts;

  const buildChartOptions = (
    data: ChartData,
    statistics?: AnalyzingStatistics,
  ) => {
    const total =
      statistics?.analyzed ||
      data.reduce((prev, curr) => {
        return prev + curr.value;
      }, 0);
    const denominator =
      (props.analyzer?.sesion.model.noneExcluded
        ? statistics?.analyzedExceptNone
        : total) || 0;
    const chartProvider = chartProviders[favoriteChart()]!;
    return chartProvider(data, { denominator, total });
    // return buildHotPieChartOptions(data, { denominator });
  };

  createEffect(() => {
    const options = buildChartOptions(
      props.analyzer?.chartData || [
        { value: 335, name: 'Direct' },
        { value: 310, name: 'Email' },
        { value: 274, name: 'Union Ads' },
        { value: 235, name: 'Video Ads' },
        { value: 400, name: 'Search Engine' },
      ],
      props.analyzer?.statistics || statistics(),
    );
    setStatistics(props.analyzer?.statistics);
    myChart?.clear();
    myChart?.setOption(options);

    const listener: (e: AnalyzingProgressEvent) => void = ({
      data,
      statistics,
    }) => {
      setStatistics(statistics);
      if (myChart) {
        const options = buildChartOptions(data, statistics);
        myChart.setOption(options);
      }
    };

    props.analyzer?.on('progress', listener);
    onCleanup(() => {
      props.analyzer?.off('progress', listener);
    });
  });

  onMount(() => {
    props.onOpenChange?.(open());
    myChart = echarts.init(chartElement);
    const options = buildChartOptions(
      props.analyzer?.chartData || [
        { value: 335, name: 'Direct' },
        { value: 310, name: 'Email' },
        { value: 274, name: 'Union Ads' },
        { value: 235, name: 'Video Ads' },
        { value: 400, name: 'Search Engine' },
      ],
      props.analyzer?.statistics || statistics(),
    );
    myChart.setOption(options);
    setStatistics(props.analyzer?.statistics);
  });

  createEffect(() => {
    if (props.open != null) {
      setOpen(props.open);
    }
  });

  createEffect(() => {
    if (open() && myChart) {
      setTimeout(() => {
        myChart.resize({ width: 'auto', height: 'auto' });
      }, 500);
    }
  });

  const handleOpenChange = () => {
    setOpen((prev) => {
      props.onOpenChange?.(!prev);
      return !prev;
    });
  };

  const handleDownloadCSV = (useCopy?: boolean) => {
    const data = props.analyzer?.csvData;
    if (!data) {
      return;
    }
    const fileName = props.analyzer?.sesion.model.excelFile?.info.name;
    if (useCopy) {
      copyExcelFile(data);
    } else {
      downloadExcelFile(data, fileName);
    }
  };

  const handleDownloadStatistics = (useCopy?: boolean) => {
    const data = props.analyzer?.statisticsCsvData;
    if (!data) {
      return;
    }
    const fileName = props.analyzer?.sesion.model.excelFile?.info.name;
    if (useCopy) {
      copyExcelFile(data);
    } else {
      downloadExcelFile(data, fileName);
    }
  };

  const handleSwitchChart = () => {
    setFavoriteChart((prev) => (prev + 1) % chartProviders.length);
  };

  const getName = () => {
    return (
      props.analyzer?.sesion.model.name ||
      props.analyzer?.sesion.model.excelFile?.info.name
    );
  };

  return (
    <Container style={{ height: '100%', width: '100%' }} elevation={7}>
      <Toolbar
        p={0.5}
        displayRaw="flex"
        justifyContent="space-between"
        alignItems="center"
        class="chart-toolbar"
      >
        <Stack direction={'row'} spacing={0}>
          {statistics() && (
            <Box ml={2} color="#fff">
              {statistics()?.analyzedExceptNone || 0}/{statistics()?.analyzed}/
              {statistics()?.total} (
              {(
                ((statistics()?.analyzed || 0) / (statistics()?.total || 0)) *
                100
              ).toFixed(2)}
              %)
            </Box>
          )}
          {getName() && open() && (
            <Box color="#fff" borderLeft={'2px solid #fff'} pl={1} ml={1}>
              {getName()}
            </Box>
          )}
        </Stack>
        <Stack direction={'row'} spacing={0} justifyContent="flex-end">
          {statistics() && open() && (
            <>
              <Tooltip title="Switch chart type">
                {(propz) => (
                  <Button onClick={() => handleSwitchChart()} {...propz}>
                    <CreativeIcon />
                  </Button>
                )}
              </Tooltip>
              <Tooltip title="Export Statistics (CSV) (Hold [Ctrl] to copy)">
                {(propz) => (
                  <Button
                    onClick={(event) => handleDownloadStatistics(event.ctrlKey)}
                    {...propz}
                  >
                    <DownloadImageIcon />
                  </Button>
                )}
              </Tooltip>
              <Tooltip title="Export Data (CSV) (Hold [Ctrl] to copy)">
                {(propz) => (
                  <Button
                    onClick={(event) => handleDownloadCSV(event.ctrlKey)}
                    {...propz}
                  >
                    <DownloadIcon />
                  </Button>
                )}
              </Tooltip>
            </>
          )}
          <Button
            onClick={handleOpenChange}
            // sx={{ color: open() ? undefined : '#fff' }}
          >
            {open() ? <CollapseIcon /> : <ExpandIcon />}
          </Button>
        </Stack>
      </Toolbar>
      <Box
        style={{
          width: '100%',
          // height: open() ? '300px' : 'auto',
        }}
      >
        <Collapse value={open()} class="chart-wrapper">
          <ChartContainer
            ref={(ref) => {
              chartElement = ref;
            }}
            class="chart-container"
            style={{ height: '300px', width: '100%' }}
          />
        </Collapse>
      </Box>
    </Container>
  );
};

export default ChartPanel;
