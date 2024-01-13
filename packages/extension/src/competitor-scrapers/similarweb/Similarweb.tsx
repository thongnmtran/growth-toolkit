/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { copyExcelFile } from '@/utils/copyExcelFile';
import { filterNull } from '@growth-toolkit/common-utils';

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
    console.log('> run');
    await backgroundTransport.connect();
    const result = await scraper.run();
    console.log('done', result);

    if (result) {
      const data = Object.values(result);
      const asRange = (...values: any) => {
        return filterNull(values).join('-');
      };
      const rows = data.map((item) => {
        const row = {
          Domain: item.domain,
          Year: item.companyInfo?.yearFounded || '',
          Employees: asRange(
            item.companyInfo?.employeesMin,
            item.companyInfo?.employeesMax,
          ),
          Revenue: asRange(
            item.companyInfo?.revenueMin,
            item.companyInfo?.revenueMax,
          ),
          Industry: item.companyInfo?.domain,
          HQ: filterNull([
            item.companyInfo?.hqCountryCode,
            item.companyInfo?.hqCity,
          ]).join(', '),
          'Global Rank': item.ranks?.global.value || '',
          'Trend Global Rank': item.ranks?.global.change || '',
          'Total Visits': item.engagement?.visitsTotalCount || '',
          'Trend Total Visits': item.traffic?.visitsTotalCountChange || '',
          'Bounce Rate': item.engagement?.bounceRate || '',
          'Pages/Visit': item.engagement?.pagesPerVisit || '',
          'Avg. Visit Duration':
            item.engagement?.visitsAvgDurationFormatted || '',
          Traffic: item.trafficByCountry
            ?.map((item) => {
              return `${item.title} (${(item.visitsShare * 100).toFixed(2)}% ${(
                item.visitsShareChange * 100
              ).toFixed(2)})`;
            })
            .join('\n'),
          'Top Keywords': item.topKeywords
            ?.map(
              (keyword) =>
                `${keyword.name} - (${keyword.volume || '?'}-${
                  keyword.estimatedValue?.toFixed(0) || '?'
                }$/${keyword.cpc?.toFixed(2) || '?'}$)`,
            )
            ?.join('\n'),
        };
        const anyRow = row as any;
        if (item.ranks?.country.code) {
          anyRow[`${item.ranks?.country.code} - Country Rank`] =
            item.ranks?.country.value || '';
          anyRow[`${item.ranks?.country.code} - Trend Country Rank`] =
            item.ranks?.country.change || '';
        }
        if (item.ranks?.category.countryCode) {
          anyRow[`${item.ranks?.category.countryCode} - Category Rank`] =
            item.ranks?.category.value || '';
          anyRow[`${item.ranks?.category.countryCode} - Trend Category Rank`] =
            item.ranks?.category.change || '';
        }
        return row;
      });

      let allKeys = rows.reduce((acc, row) => {
        return [...acc, ...Object.keys(row)];
      }, [] as string[]);
      allKeys = [...new Set(allKeys)];
      rows.forEach((row) => {
        allKeys.forEach((key) => {
          if (!(key in row)) {
            (row as any)[key] = '';
          }
        });
      });
      copyExcelFile(rows);
    }
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
