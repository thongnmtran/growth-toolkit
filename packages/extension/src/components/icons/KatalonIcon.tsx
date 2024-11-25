import { Component } from 'solid-js';
import { SVGProps } from './icon-types';

interface KatalonIconProps extends SVGProps {}

const KatalonIcon: Component<KatalonIconProps> = (props) => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 145 145"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M122 96.6621H73.5V145H122V96.6621Z" fill="#19D89F" />
      <path
        d="M73.486 0L25 48.3379V96.6622H73.486L121.986 48.3379V0H73.486Z"
        fill="black"
      />
    </svg>
  );
};

export default KatalonIcon;
