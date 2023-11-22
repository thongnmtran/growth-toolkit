import { Component } from 'solid-js';

interface PieChartIconProps {}

const PieChartIcon: Component<PieChartIconProps> = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <g
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
      >
        <path d="M0 0h24v24H0z" />
        <path
          fill="currentColor"
          d="M9.883 2.207a1.9 1.9 0 0 1 2.087 1.522l.025.167L12 4v7a1 1 0 0 0 .883.993L13 12h6.8a2 2 0 0 1 2 2a1 1 0 0 1-.026.226A10 10 0 1 1 9.504 2.293l.27-.067l.11-.02z"
        />
        <path
          fill="currentColor"
          d="M14 3.5V9a1 1 0 0 0 1 1h5.5a1 1 0 0 0 .943-1.332a10 10 0 0 0-6.11-6.111A1 1 0 0 0 14 3.5z"
        />
      </g>
    </svg>
  );
};

export default PieChartIcon;
