/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { hslToRgb } from '@suid/system';
import { ChartData, EChartsOption } from './chart-types';
import { hash } from '@growth-toolkit/common-utils';

export function buildBarChartOptions2(
  data: ChartData,
  options: {
    denominator?: number;
    total?: number;
  },
) {
  const { denominator = 1 } = options;

  const calcPercentage = (value: any) => {
    return `${((+value / denominator) * 100).toFixed(1)}%`;
  };

  data.push({
    name: 'Total',
    value: denominator,
  });

  data = data.sort((a, b) => {
    return a.value - b.value;
  });

  const range = 360;
  const step = range / data.length;
  const colors = [...new Array(data.length)]
    .map((_, index) => hslToRgb(`hsl(${step * index}, 100%, 70%)`))
    .reverse();

  const names = data.map((item) => item.name);
  const hashedNames = names.map((name) => hash(name)).sort();

  const option: EChartsOption = {
    backgroundColor: '#fff',
    grid: {
      top: 30,
      bottom: 30,
      left: 30,
      right: 30,
    },

    legend: {
      show: false,
    },

    tooltip: {
      trigger: 'axis',
      valueFormatter(value) {
        return `${calcPercentage(value)} | ${value}`;
      },
      showContent: true,
      axisPointer: {
        type: 'shadow',
      },
    },

    xAxis: [
      {
        type: 'value',
        boundaryGap: [0, 0],
        max: denominator,
        min: 0,
      },
    ],
    yAxis: {
      type: 'category',
      data: data.map((item) => item.name),
      axisTick: { show: false },
      show: false,
      axisLabel: {
        width: 200,
      },
    },
    series: [
      {
        data: data.map((item) => ({
          name: item.name,
          value: item.value,
          label: {
            position: 'insideLeft',
            verticalAlign: 'middle',
            // align: 'left',
            show: true,
            color: '#123',
            formatter: ({ value, name }) => {
              return `${name} - ${calcPercentage(value)} (${value})`;
            },
          },
          emphasis: {
            focus: 'series',
          },
          itemStyle: {
            color: colors[hashedNames.indexOf(hash(item.name))],
            shadowBlur: 3,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowOffsetX: 2,
            shadowOffsetY: 2,
          },
          animationType: 'scale',
          animationEasing: 'elasticOut',
          animationDelay: function () {
            return Math.random() * 200;
          },
        })),
        type: 'bar',
      },
    ],
  };
  return option;
}
