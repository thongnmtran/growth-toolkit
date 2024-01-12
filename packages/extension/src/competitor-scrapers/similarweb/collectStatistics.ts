import {
  collectReactProps,
  exposeAPI,
  findElement,
  waitForSelector,
} from '@/helpers/automator';
import { SimiarwebSiteInfo } from './types/SimilarwebSiteInfo';
import { SimilarwebCompanyInfo } from './types/SimilarwebCompanyInfo';
import { SimilarwebEngagement } from './types/SimilarwebEngagement';
import { SimilarwebTrafficByCountry } from './types/SimilarwebTrafficByCountry';
import { SimilarwebTopKeyword } from './types/SimilarwebTopKeyword';
import GlobalStore from '@/utils/GlobalStore';
import { SimilarwebCategoryLeader } from './types/SimilarwebCategoryLeader';
import { delay, randomInt } from '@growth-toolkit/common-utils';
import { copyExcelFile } from '@/utils/copyExcelFile';

export function collectStatistics(): SimiarwebSiteInfo {
  const companyInfo: SimilarwebCompanyInfo = collectReactProps(
    '.app-company-info',
    'children[0].props.data',
  );

  const ranks = collectReactProps(
    '.wa-overview__column--ranking',
    'children.props',
  );

  const engagement: SimilarwebEngagement = collectReactProps(
    '.wa-overview__column--engagement',
    'children[1].props',
  );

  const traffic = collectReactProps(
    '.wa-traffic__main-content--comparison',
    'children[0].props',
  );

  const trafficByCountry: SimilarwebTrafficByCountry[] = collectReactProps(
    '.wa-geography .app-section__container',
    'children[3].props.children[0].props.data',
  );

  const topKeywords: SimilarwebTopKeyword[] = collectReactProps(
    '.wa-keywords__main-content',
    'children.props.keywords',
  );

  const info = {
    companyInfo,
    ranks,
    engagement,
    traffic,
    trafficByCountry,
    topKeywords,
  };

  const domain = companyInfo.domain;
  if (domain) {
    GlobalStore.set(domain, info);
  }

  return info;
}
exposeAPI('collectStatistics', collectStatistics);

export function collectCategoryLeaders() {
  const data: SimilarwebCategoryLeader[] = collectReactProps(
    '.swTable',
    'children.props.tableData',
  );
  return data;
}
exposeAPI('collectCategoryLeaders', collectCategoryLeaders);

export async function collectAllLeaders() {
  const allLeaders: SimilarwebCategoryLeader[] = [];
  exposeAPI('allLeaders', allLeaders);
  let curPage = [];
  do {
    curPage = collectCategoryLeaders();
    allLeaders.push(...curPage);
    console.log(allLeaders);
    const nextButton = findElement(
      '[data-automation-pagination-control="control-right"]:not([data-automation-pagination-control-disabled="true"])',
    );
    if (nextButton) {
      const noise = randomInt(10, 30);
      console.log('> Delay:', noise);
      await delay(`${noise}s`);
      nextButton.click();
      await delay('5s');
      await waitForSelector('.swTable--big-table');
    } else {
      break;
    }
  } while (curPage.length > 0);
  console.log('> Done:', allLeaders);
  return allLeaders;
}
exposeAPI('collectAllLeaders', collectAllLeaders);

exposeAPI('copyCSV', () => {
  // const data = indiaSoftware;
  // indiaSoftware2.forEach((item) => {
  //   if (!data.find((item2) => item2.Id === item.Id)) {
  //     data.push(item);
  //   }
  // });
  setTimeout(() => {
    copyExcelFile([]);
    console.log('> Copied');
  }, 3000);
});
