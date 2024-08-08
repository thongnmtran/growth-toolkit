import { Dialog, DialogContent, Stack } from '@suid/material';
import { Component } from 'solid-js';

interface ExportDialogProps {
  open: boolean;
  onClose?: () => void;
}

const ExportDialog: Component<ExportDialogProps> = (props) => {
  return (
    <Dialog {...props} maxWidth="xl" onClose={props.onClose}>
      <DialogContent
        sx={{ minWidth: '500px', minHeight: '300px' }}
        no-prevent-default="true"
        data-scrollable-element="true"
      >
        <Stack spacing={2}>Hello</Stack>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
