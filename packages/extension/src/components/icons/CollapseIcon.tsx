import { Component } from 'solid-js';

interface CollapseIconProps {}

const CollapseIcon: Component<CollapseIconProps> = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <path
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M19 15h-4m0 0v4m0-4l4 4M5 9h4m0 0V5m0 4L5 5m14 4h-4m0 0V5m0 4l4-4M5 15h4m0 0v4m0-4l-4 4"
      />
    </svg>
  );
};

export default CollapseIcon;
