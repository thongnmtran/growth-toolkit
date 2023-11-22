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
import CollapseIcon from './icons/CollapseIcon';
import { Collapse } from 'solid-collapse';
import ExpandIcon from './icons/ExpandIcon';
import {
  AnalyzingProgressEvent,
  AnalyzingStatistics,
  DeepAnalyzer,
} from '@/services/DeepAnalyzer';
import DownloadIcon from './icons/DownloadIcon';
import { downloadExcelFile } from '@/helpers/downloadExcelFile';
import DownloadImageIcon from './icons/DownloadImageIcon';
import { copyExcelFile } from '@/helpers/copyExcelFile';
import Tooltip from './common/Tooltip';

type EChartsOption = echarts.EChartsOption;

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

type ChartData = { name: string; value: number }[];

interface ChartPanelProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  analyzer?: DeepAnalyzer;
}

const ChartPanel: Component<ChartPanelProps> = (props) => {
  const [open, setOpen] = createSignal(false);
  const [statistics, setStatistics] = createSignal<AnalyzingStatistics>();

  let chartElement: HTMLElement;
  let myChart: echarts.ECharts;

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
    myChart?.setOption(options);
    setStatistics(props.analyzer?.statistics);

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
    downloadExcelFile(data, fileName);
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

  const buildChartOptions = (
    data: ChartData,
    statistics?: AnalyzingStatistics,
  ) => {
    const minValue = data.reduce((prev, curr) => {
      return Math.min(prev, curr.value);
    }, 0);
    const maxValue = data.reduce((prev, curr) => {
      return Math.max(prev, curr.value);
    }, 0);
    const total =
      statistics?.analyzed ||
      data.reduce((prev, curr) => {
        return prev + curr.value;
      }, 0);

    const calcPercentage = (value: any) => {
      const denominator =
        (props.analyzer?.sesion.model.noneExcluded
          ? statistics?.analyzedExceptNone
          : total) || 0;
      return `${((+value / denominator) * 100).toFixed(1)}%`;
    };

    const option: EChartsOption = {
      backgroundColor: '#2c343cff',

      // title: {
      //   text: 'Customized Pie',
      //   left: 'center',
      //   top: 20,
      //   textStyle: {
      //     color: '#ccc',
      //   },
      // },

      tooltip: {
        trigger: 'item',
        valueFormatter(value) {
          return `${calcPercentage(value)} | ${value}`;
        },
      },

      // legend: {
      //   left: 'left',
      //   orient: 'vertical',
      //   show: true,
      //   backgroundColor: 'rgba(255,255,255,.8)',
      // },

      visualMap: {
        show: false,
        min: minValue / 2,
        max: maxValue * 2,
        inRange: {
          colorLightness: [0, 1],
        },
      },
      series: [
        {
          name: 'Access From',
          type: 'pie',
          radius: '55%',
          center: ['50%', '50%'],
          data: data.sort(function (a, b) {
            return a.value - b.value;
          }),
          roseType: 'radius',
          label: {
            color: 'rgba(255, 255, 255, 0.3)',
            formatter: ({ name, value }) => {
              return `${name} (${calcPercentage(value)} | ${value})`;
            },
          },
          labelLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)',
            },
            smooth: 0.2,
            length: 10,
            length2: 20,
          },
          itemStyle: {
            color: '#c23531',
            shadowBlur: 200,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },

          animationType: 'scale',
          animationEasing: 'elasticOut',
          animationDelay: function () {
            return Math.random() * 200;
          },
        },
      ],
    };
    return option;
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
