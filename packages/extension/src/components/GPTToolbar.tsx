import { Component } from 'solid-js';
import KatalonIcon from './KatalonIcon';
import { Box, IconButton, styled } from '@suid/material';

const Toolbar = styled(Box)({
  width: '50px',
  height: '50px',
  padding: '0px',
  margin: '0px 5px',
});

interface GPTToolbarProps {}

const GPTToolbar: Component<GPTToolbarProps> = () => {
  return (
    <Toolbar>
      <IconButton>
        <KatalonIcon />
      </IconButton>
    </Toolbar>
  );
};

export default GPTToolbar;
