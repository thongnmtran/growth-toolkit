import { Component } from 'solid-js';

interface DownloadIconProps {}

const DownloadIcon: Component<DownloadIconProps> = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox="0 0 14 14"
    >
      <path
        fill="currentColor"
        fill-rule="evenodd"
        d="M1.44.44A1.5 1.5 0 0 1 2.5 0h6a.5.5 0 0 1 .354.146l4 4A.5.5 0 0 1 13 4.5v8a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 1 12.5v-11c0-.398.158-.78.44-1.06Zm5.747 10.502l.104-.104c.116-.076.216-.176.292-.292l1.854-1.854a.625.625 0 0 0-.442-1.067h-1.25V4a1 1 0 0 0-2 0v3.625h-1.25a.625.625 0 0 0-.442 1.067l1.854 1.854c.076.116.176.216.292.292l.104.104a.625.625 0 0 0 .884 0Z"
        clip-rule="evenodd"
      />
    </svg>
  );
};

export default DownloadIcon;
