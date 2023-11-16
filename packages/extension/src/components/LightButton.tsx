import { IconButton, styled } from '@suid/material';
import { IconButtonProps } from '@suid/material/IconButton';
import { Component } from 'solid-js';

const Button = styled(IconButton)({
  appearance: 'none',
  height: '80%',
  width: '80%',
  padding: '20%',
  background: 'linear-gradient(to top, #fafafa, #d0d3d8)',
  position: 'relative',
  margin: 'auto',
  borderRadius: '50%',
  cursor: 'pointer',
  outline: 'none',
  transition: 'all 0.14s ease-in-out',

  '&::before': {
    position: 'absolute',
    content: '""',
    height: '140%',
    width: '140%',
    background: 'linear-gradient(to bottom, #fafafa, #d0d3d8)',
    borderRadius: '50%',
    zIndex: '-1',
    top: '-20%',
    left: '-20%',
    boxShadow: '0 3px 5px rgba(0,0,0,0.1)',
    transition: 'all 0.14s ease-in-out',
  },
  '&::after': {
    position: 'absolute',
    content: '""',
    height: '160%',
    width: '160%',
    background: '#d6dce3',
    top: '-30%',
    left: '-30%',
    zIndex: '-2',
    borderRadius: '50%',
    boxShadow: 'inset 0 -3px 8px rgba(0,0,0,0.2)',
    transition: 'all 0.14s ease-in-out',
  },

  '&:hover': {
    width: '90%',
    height: '90%',
    padding: '15%',
    background: 'linear-gradient(to top, #ffffff, #bbbbbb)',

    '&::before': {
      height: '130%',
      width: '130%',
      top: '-15%',
      left: '-15%',
      background: 'linear-gradient(to bottom, #ffffff, #afa9af)',
      boxShadow: '0 3px 5px rgba(0,0,0,0.3)',
    },
    '&::after': {
      height: '140%',
      width: '140%',
      top: '-20%',
      left: '-20%',
      background:
        'radial-gradient(311px at 8.6% 27.9%, rgba(62, 147, 252, 0.57) 12.9%, rgba(239, 183, 192, 0.44) 91.2%)',
      boxShadow: 'inset 0 -3px 8px rgba(0,0,0,0.5)',
    },
  },
});

interface LightButtonProps extends IconButtonProps {}

const LightButton: Component<LightButtonProps> = (props) => {
  return <Button {...props} />;
};

export default LightButton;
