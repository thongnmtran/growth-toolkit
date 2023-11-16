import { Box, Card, Stack, styled } from '@suid/material';
import { Component } from 'solid-js';
import GoogleSheetIcon from './icons/GoogleSheetIcon';
import { FileInfo } from '@/models/FileInfo';
import { formatTime } from '@katalon-toolbox/common-utils';

const Container = styled(Card)({
  background:
    '#ffffff linear-gradient(159deg, rgba(40, 91, 212, 0.73) -3%, rgba(171, 53, 163, 0.45) 49.3%, rgba(255, 204, 112, 0.37) 97.7%)',
  color: '#fff',
});

interface FileInfoBoxProps {
  info?: FileInfo;
}

const FileInfoBox: Component<FileInfoBoxProps> = (props) => {
  return (
    <Container elevation={3}>
      <Stack direction={'row'} p={1} alignItems="center">
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
    </Container>
  );
};

export default FileInfoBox;
