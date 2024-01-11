import { TextField, styled } from '@suid/material';

export const GPTTextField = styled(TextField)({
  width: '100%',
  '& *': {
    boxShadow: 'none !important',
  },
});
