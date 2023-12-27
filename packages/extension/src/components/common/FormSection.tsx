import { Box, Stack } from '@suid/material';
import BoxProps from '@suid/material/Box/BoxProps';
import { Component } from 'solid-js';

interface FormSectionProps extends BoxProps {
  label?: string;
}

const FormSection: Component<FormSectionProps> = (props) => {
  return (
    <Box
      {...props}
      position="relative"
      padding={'20px 8px 8px'}
      border={'2px dashed #eee'}
      borderRadius={1}
    >
      <Stack
        sx={{
          position: 'absolute',
          top: '-11px',
          left: '17px',
          background: '#fff',
          padding: '0 4px',
          border: '2px dashed #eee',
          borderRadius: '4px',
          color: '#aaa',
        }}
        spacing={2}
      >
        {props.label}
      </Stack>
      {props.children}
    </Box>
  );
};

export default FormSection;
