/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChartData, EChartsOption } from './chart-types';

export const buildHotPieChartOption = (
  data: ChartData,
  options: {
    denominator?: number;
  },
) => {
  const { denominator = 1 } = options;

  const minValue = data.reduce((prev, curr) => {
    return Math.min(prev, curr.value);
  }, 0);
  const maxValue = data.reduce((prev, curr) => {
    return Math.max(prev, curr.value);
  }, 0);

  const calcPercentage = (value: any) => {
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
      },
    ],
  };
  return option;
};
