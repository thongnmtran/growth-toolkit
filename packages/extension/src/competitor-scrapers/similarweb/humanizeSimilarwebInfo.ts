/* eslint-disable @typescript-eslint/no-explicit-any */
import { filterNull } from '@growth-toolkit/common-utils';
import { SimilarWebSiteInfo } from './types/SimilarwebSiteInfo';

export function humanizeSimilarwebInfo(item: SimilarWebSiteInfo) {
  const asRange = (...values: any) => {
    return filterNull(values).join('-');
  };

  const row = {
    Domain: item.domain,
    Year: item.companyInfo?.yearFounded || '',
    'Employee Range (Similarweb)': asRange(
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
    'Avg. Visit Duration': item.engagement?.visitsAvgDurationFormatted || '',
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
}
