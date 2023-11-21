import { Box, Card, IconButton, Stack, styled } from '@suid/material';
import { Component, createSignal } from 'solid-js';
import GoogleSheetIcon from '../icons/GoogleSheetIcon';
import { formatTime } from '@growth-toolkit/common-utils';
import { FileInfo } from '@growth-toolkit/common-models';
import RefreshIcon from '../icons/RefreshIcon';
import { Spinner, SpinnerType } from 'solid-spinner';

const Container = styled(Card)({
  background:
    '#ffffff linear-gradient(159deg, rgba(40, 91, 212, 0.73) -3%, rgba(171, 53, 163, 0.45) 49.3%, rgba(255, 204, 112, 0.37) 97.7%)',
  color: '#fff',
});

interface FileInfoBoxProps {
  info?: FileInfo;
  onRefresh?: () => Promise<void>;
}

const FileInfoBox: Component<FileInfoBoxProps> = (props) => {
  const [reloading, setReloading] = createSignal(false);

  const handleRefresh = async () => {
    setReloading(true);
    try {
      await props.onRefresh?.();
    } finally {
      setReloading(false);
    }
  };

  return (
    <Container elevation={3}>
      <Stack
        direction={'row'}
        p={1}
        alignItems="center"
        justifyContent="space-between"
      >
        <Stack direction={'row'}>
          <Box width={30} height={40} mr={1}>
            <GoogleSheetIcon />
          </Box>
          <Stack>
            {props.info?.name && <Box>{props.info?.name}</Box>}
            {props.info?.createdTime && (
              <Box>{formatTime(props.info?.createdTime)}</Box>
            )}
          </Stack>
        </Stack>
        <IconButton onClick={handleRefresh} sx={{ color: '#fff' }}>
          {reloading() ? (
            <Spinner type={SpinnerType.oval} width={24} height={24} />
          ) : (
            <RefreshIcon />
          )}
        </IconButton>
      </Stack>
    </Container>
  );
};

export default FileInfoBox;