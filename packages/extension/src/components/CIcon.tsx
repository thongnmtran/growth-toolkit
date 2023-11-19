/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Icon as IconifyIcon, IconifyIconProps } from '@iconify-icon/solid';
import { Merge } from '@growth-toolkit/common-utils';
import { Component, JSXElement } from 'solid-js';

export type AnyIconInput = IconifyIconProps['icon'] | JSXElement;

export type CIconProps = Merge<
  [
    IconifyIconProps,
    {
      icon: AnyIconInput;
    },
  ]
>;

const CIcon: Component<CIconProps> = (props) => {
  return (
    <>
      {typeof props.icon === 'string' ? (
        <IconifyIcon
          {...props}
          icon={props.icon}
          // @ts-ignore
          attr:icon={props.icon}
          style={{
            'font-size': '1.2rem',
            display: 'inline-flex',
            'align-items': 'center',
            ...(props.style as any),
          }}
        />
      ) : (
        props.icon
      )}
    </>
  );
};

export default CIcon;
