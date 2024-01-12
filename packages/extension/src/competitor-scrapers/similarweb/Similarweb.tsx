import { SimilarwebScraper } from '@/background/SimilarwebScraper';
import KatalonIcon from '@/components/icons/KatalonIcon';
import { ChromeRuntimeTransport } from '@/transports/ChromeRuntimeTransport';
import {
  NewRemoteObjectHelper,
  asSyncTransport,
} from '@growth-toolkit/common-transport';
import { Box, Card, IconButton, styled } from '@suid/material';
import { Component } from 'solid-js';
import { exposeAPI } from '@/helpers/automator';
import { PageTransportServer } from '@/transports/PageTransportServer';

const Pivot = styled(Card)({
  position: 'fixed',
  top: 128,
  right: 10,
  zIndex: 999999999,
});

interface SimilarwebProps {}

const Similarweb: Component<SimilarwebProps> = () => {
  const backgroundTransport = asSyncTransport(
    new ChromeRuntimeTransport(chrome.runtime.id),
  );

  const scraper = NewRemoteObjectHelper.wrapClient(
    {} as SimilarwebScraper,
    backgroundTransport,
    'scraper',
  );
  exposeAPI('scraper', scraper);

  const pageTransportServer = new PageTransportServer();
  pageTransportServer.listen();
  pageTransportServer.addConnectionListener(async (pageTransport) => {
    NewRemoteObjectHelper.linkChannels(
      backgroundTransport,
      pageTransport,
      'scraper-client',
    );
  });

  const handleRun = async () => {
    await backgroundTransport.connect();
    const result = await scraper.run();
    console.log('done', result);
  };

  return (
    <Pivot elevation={5}>
      <Box p={1}>
        <IconButton onClick={handleRun}>
          <KatalonIcon width={30} height={30} />
        </IconButton>
      </Box>
    </Pivot>
  );
};

export default Similarweb;
