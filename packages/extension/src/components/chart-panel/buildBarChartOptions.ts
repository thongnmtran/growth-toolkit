/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChartData, EChartsOption } from './chart-types';

export function buildBarChartOptions(
  data: ChartData,
  options: {
    denominator?: number;
  },
) {
  const { denominator = 1 } = options;

  const calcPercentage = (value: any) => {
    return `${((+value / denominator) * 100).toFixed(1)}%`;
  };

  data = data.sort((a, b) => {
    return b.value - a.value;
  });

  const option: EChartsOption = {
    backgroundColor: '#fff',

    tooltip: {
      trigger: 'item',
      valueFormatter(value) {
        return `${calcPercentage(value)} | ${value}`;
      },
    },

    xAxis: {
      type: 'value',
    },
    yAxis: {
      type: 'category',
      data: data.map((item) => item.name),
      offset: 5,
    },
    series: [
      {
        data: data,
        type: 'bar',
      },
    ],
  };
  return option;
}
