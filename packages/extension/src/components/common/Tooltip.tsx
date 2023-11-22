/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Popover } from '@suid/material';
import { Component, JSXElement, createSignal } from 'solid-js';

interface TooltipProps {
  title?: string;
  children: (props: {
    onMouseEnter: (event: { currentTarget: Element }) => void;
    onMouseLeave: () => void;
  }) => JSXElement;
}

const Tooltip: Component<TooltipProps> = (props) => {
  const [anchorEl, setAnchorEl] = createSignal<Element | null>(null);

  const onMouseEnter = (event: { currentTarget: Element }) => {
    setAnchorEl(event.currentTarget);
  };

  const onMouseLeave = () => {
    setAnchorEl(null);
  };

  const open = () => Boolean(anchorEl());

  return (
    <>
      {props.children({ onMouseEnter, onMouseLeave })}
      <Popover
        sx={{ pointerEvents: 'none' }}
        open={open()}
        anchorEl={anchorEl()}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        anchorOrigin={{
          vertical: -5,
          horizontal: 'center',
        }}
        onClose={onMouseLeave}
        disableRestoreFocus
      >
        <Box px={1} color="#666">
          {props.title}
        </Box>
      </Popover>
    </>
  );
};

export default Tooltip;
