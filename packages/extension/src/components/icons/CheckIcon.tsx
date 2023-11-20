import { Component } from 'solid-js';

interface CheckIconProps {}

const CheckIcon: Component<CheckIconProps> = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 128 128"
    >
      <path
        fill="#40c0e7"
        stroke="#40c0e7"
        stroke-miterlimit="10"
        stroke-width="6"
        d="M48.3 103.45L12.65 67.99a2.2 2.2 0 0 1 0-3.12l9-9.01c.86-.86 2.25-.86 3.11 0l23.47 23.33c.86.86 2.26.85 3.12-.01l51.86-52.36c.86-.87 2.26-.87 3.13-.01l9.01 9.01c.86.86.86 2.25.01 3.11l-56.5 57.01l.01.01l-7.45 7.49c-.86.86-2.26.86-3.12.01z"
      />
    </svg>
  );
};

export default CheckIcon;
