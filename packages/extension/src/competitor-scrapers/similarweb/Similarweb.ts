import {
  collectReactProps,
  exposeAPI,
  findElement,
  waitForSelector,
} from '@/helpers/automator';
import { fetchGoogleSheet } from '@/utils/fetchGoogleFile';
import { CategoryLeader } from './types/CategoryLeader';
import { delay, randomInt } from '@growth-toolkit/common-utils';
import { copyExcelFile } from '@/utils/copyExcelFile';
import GlobalStore from '@/utils/GlobalStore';
import { SimilarwebCompanyInfo } from './types/SimilarwebCompanyInfo';
import { SimilarwebTrafficByCountry } from './types/SimilarwebTrafficByCountry';
import { SimilarwebTopKeyword } from './types/SimilarwebTopKeyword';
import { SimilarwebEngagement } from './types/SimilarwebEngagement';

const state = {
  running: '',
  pedding: 0,
};

const saveState = () => {
  GlobalStore.set('state', state);
};

const loadState = () => {
  Object.assign(state, GlobalStore.get('state', {}));
};

/* eslint-disable @typescript-eslint/no-explicit-any */
async function run() {
  state.running = '1';
  saveState();

  let domains = GlobalStore.get<string[]>('domains', []);
  if (domains.length <= 0) {
    const data = await fetchGoogleSheet(
      'https://docs.google.com/spreadsheets/d/1wuDn1-dHaU9gwbGDIfDgoJCAVX-AAU1IXK8ovlP3kpU/edit#gid=707279259',
    );
    domains = data.rows.map((row) => row['Domain']).filter(Boolean);
    GlobalStore.set('domains', domains);
  }

  domains = domains.slice(7, 8);
  for (const domain of domains) {
    const searchButton = findElement('app-subheader__search-button');
    searchButton?.click();
    await delay('2s');

    const searchInput = findElement<HTMLInputElement>('.app-search__input');
    if (searchInput) {
      searchInput.value = domain;
      const onChange = collectReactProps('.app-search__input', 'onChange');
      onChange?.({ target: searchInput });
      await delay('2s');
      const firstResult = await waitForSelector(
        '.app-search__list-line .app-search__link',
      );
      if (!firstResult) {
        continue;
      }

      state.pedding = 1;
      saveState();

      firstResult.click();
      await waitForSelector('.app-search__dropdown', { hidden: true });
      await delay('5s');
    }

    const info = collectDomainStatistics();
    console.log(info);
  }

  state.running = '';
  saveState();
}
exposeAPI('run', run);

loadState();
if (state.running) {
  run();
}

function collectDomainStatistics() {
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
exposeAPI('collectDomainStatistics', collectDomainStatistics);

function collectCategoryLeaders() {
  const data: CategoryLeader[] = collectReactProps(
    '.swTable',
    'children.props.tableData',
  );
  return data;
}
exposeAPI('collectCategoryLeaders', collectCategoryLeaders);

export async function collectAllLeaders() {
  const allLeaders: CategoryLeader[] = [];
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
console.log('> Similarweb API loaded');
