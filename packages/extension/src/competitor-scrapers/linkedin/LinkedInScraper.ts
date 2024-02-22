/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  findElement,
  getElementText,
  setText,
  waitForSelector,
} from '@/helpers/automator';
import { LinkedInCompanyInfo } from './LinkedInCompanyInfo';
import { delay } from '@growth-toolkit/common-utils';

function collectPercentage(value: string): number {
  const percentage = (Number.parseFloat(value) || 0) / 100;
  return percentage || 0;
}

function parseRawNumber(value: string) {
  const map = [
    { suffix: 'T', threshold: 1e12 },
    { suffix: 'B', threshold: 1e9 },
    { suffix: 'M', threshold: 1e6 },
    { suffix: 'K', threshold: 1e3 },
    { suffix: '', threshold: 1 },
  ];
  const unit = map.find(({ suffix }) =>
    value.toLocaleUpperCase().includes(suffix),
  );
  return Number.parseFloat(value) * unit!.threshold;
}

async function select(selector: string, options: string[]) {
  const selectElement = findElement(selector);
  if (!selectElement) {
    return;
  }

  selectElement.click();
  await waitForSelector(
    `//div[@visible=""]//*[contains(@class, "org-insights-premium-dropdown__option")]`,
    { timeout: 3000 },
  );
  options.forEach((option) => {
    const ele = findElement(
      `//div[@visible=""]//*[contains(@class, "org-insights-premium-dropdown__option--nonselected")]/button[text() = "${option}"]`,
    );
    ele?.click();
  });
  const closeBtn = findElement(
    `//div[@visible=""]//*[contains(@class, "artdeco-hoverable-content__close-btn")]`,
  );
  closeBtn?.click();
}

export class LinkedInScraper {
  async search(name: string) {
    await setText('input.search-global-typeahead__input', name);
    await delay('3s');
    const firstResult = await waitForSelector(
      '//*[contains(@class, "typeahead-suggestion") and contains(., "Company")]',
    );

    if (firstResult) {
      firstResult.click();
      const link = await waitForSelector<HTMLAnchorElement>(
        '.entity-result__title-text a',
      ).catch(() => {});
      return link?.href;
    }

    return undefined;
  }

  async scrape(): Promise<LinkedInCompanyInfo> {
    scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    await delay('1s');

    const name = getElementText('.org-top-card-summary__title');
    const rawNumFollowers = getElementText(
      '.org-top-card-summary-info-list div:nth-child(2) div:nth-child(2)',
    );
    const numFollowers = parseRawNumber(rawNumFollowers);
    const numEmployees = +getElementText(
      '[headers="org-insights-module__a11y-summary-total"]',
    );
    const employeeRange = getElementText(
      '.org-top-card-summary-info-list div:nth-child(2) *:nth-child(3)',
    );

    // Six months headcount growth
    const rawSixMonthsHeadcountGrowth = getElementText(
      '[headers="org-insights-module__a11y-summary-6"] .visually-hidden',
    );
    const sixMonthsHeadcountGrowth = collectPercentage(
      rawSixMonthsHeadcountGrowth,
    );

    // One year headcount growth
    const rawOneYearHeadcountGrowth = getElementText(
      '[headers="org-insights-module__a11y-summary-12"] .visually-hidden',
    );
    const oneYearHeadcountGrowth = collectPercentage(rawOneYearHeadcountGrowth);

    // Two years headcount growth
    const rawTwoYearsHeadcountGrowth = getElementText(
      '[headers="org-insights-module__a11y-summary-24"] .visually-hidden',
    );
    const twoYearsHeadcountGrowth = collectPercentage(
      rawTwoYearsHeadcountGrowth,
    );

    async function collectRow(label: string, table: HTMLElement) {
      const row = await waitForSelector(
        `.//*[text()="${label}"]//ancestor::tr`,
        {
          parent: table,
        },
      )!;
      function collectCell(index: number) {
        return row
          ? collectPercentage(
              getElementText(
                `td:nth-child(${index}) [class="visually-hidden"]`,
                row,
              ),
            )
          : undefined;
      }
      return [collectCell(2)!, collectCell(3)!, collectCell(4)!];
    }
    const employeeTable = await waitForSelector(
      '.org-insights-functions-growth__table',
      { timeout: 5000 },
    ).catch(() => {});
    await select(
      '[data-view-name="premium-insights-headcount-functions-dropdown"]',
      ['Engineering', 'Sales'],
    );
    const [sixMonthsEngineersGrowth, oneYearEngineersGrowth] = employeeTable
      ? await collectRow('Engineering', employeeTable)
      : [];
    const [sixMonthsSalesGrowth, oneYearSalesGrowth] = employeeTable
      ? await collectRow('Sales', employeeTable)
      : [];

    const jobTable = await waitForSelector(
      '[summary="Total job openings"] ~ .org-insights-functions-growth__table',
      { timeout: 5000 },
    ).catch(() => {});
    await select(
      '[data-view-name="premium-insights-job-openings-functions-dropdown"]',
      ['Engineering', 'Sales'],
    );
    const [
      threeMonthsEngineerJobOpenings,
      sixMonthsEngineerJobOpenings,
      oneYearEngineerJobOpenings,
    ] = jobTable ? await collectRow('Engineering', jobTable) : [];
    const [
      threeMonthsSalesJobOpenings,
      sixMonthsSalesJobOpenings,
      oneYearSalesJobOpenings,
    ] = jobTable ? await collectRow('Sales', jobTable) : [];

    return {
      name,
      linkedInUrl: window.location.href,
      numFollowers,
      numEmployees,
      employeeRange,
      oneYearHeadcountGrowth,
      sixMonthsHeadcountGrowth,
      twoYearsHeadcountGrowth,
      sixMonthsEngineersGrowth: sixMonthsEngineersGrowth!,
      oneYearEngineersGrowth: oneYearEngineersGrowth!,
      sixMonthsSalesGrowth: sixMonthsSalesGrowth!,
      oneYearSalesGrowth: oneYearSalesGrowth!,
      threeMonthsEngineerJobOpenings: threeMonthsEngineerJobOpenings!,
      sixMonthsEngineerJobOpenings: sixMonthsEngineerJobOpenings!,
      oneYearEngineerJobOpenings: oneYearEngineerJobOpenings!,
      threeMonthsSalesJobOpenings: threeMonthsSalesJobOpenings!,
      sixMonthsSalesJobOpenings: sixMonthsSalesJobOpenings!,
      oneYearSalesJobOpenings: oneYearSalesJobOpenings!,
    };
  }
}
