/* eslint-disable solid/no-innerhtml */
import { Box, Popover } from '@suid/material';
import { Component } from 'solid-js';

interface DynamicToolTipProps {
  x?: number;
  y?: number;
  anchorWidth?: number;
  open?: boolean;
  html?: string;
}

const DynamicToolTip: Component<DynamicToolTipProps> = (props) => {
  return (
    <Popover
      sx={{ pointerEvents: 'none' }}
      open={!!props.open}
      anchorReference="anchorPosition"
      anchorPosition={{
        left: (props.x || 0) + (props.anchorWidth || 0) / 2,
        top: (props.y || 0) - 5,
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      anchorOrigin={{
        vertical: -5,
        horizontal: 'center',
      }}
      disableRestoreFocus
    >
      <Box px={1} color="#666" sx={{ maxWidth: '400px' }}>
        <div innerHTML={props.html || ''} />
      </Box>
    </Popover>
  );
};

export default DynamicToolTip;
