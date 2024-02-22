import { LinkedInCompanyInfo } from './LinkedInCompanyInfo';

export function humanizeLinkedInInfo(info?: LinkedInCompanyInfo) {
  if (!info) {
    return {};
  }
  return {
    Company: info.name,
    LinkedIn: info.linkedInUrl,
    Followers: info.numFollowers,
    Employees: info.numEmployees,
    'Employee Range (LinkedIn)': info.employeeRange,
    '6 Months Headcount Growth': info.sixMonthsHeadcountGrowth,
    '1 Year Headcount Growth': info.oneYearHeadcountGrowth,
    '2 Years Headcount Growth': info.twoYearsHeadcountGrowth,
    '6 Months Engineers Growth': info.sixMonthsEngineersGrowth,
    '1 Year Engineers Growth': info.oneYearEngineersGrowth,
    '6 Months Sales Growth': info.sixMonthsSalesGrowth,
    '1 Year Sales Growth': info.oneYearSalesGrowth,
    '3 Months Engineer Job Openings': info.threeMonthsEngineerJobOpenings,
    '6 Months Engineer Job Openings': info.sixMonthsEngineerJobOpenings,
    '1 Year Engineer Job Openings': info.oneYearEngineerJobOpenings,
    '3 Months Sales Job Openings': info.threeMonthsSalesJobOpenings,
    '6 Months Sales Job Openings': info.sixMonthsSalesJobOpenings,
    '1 Year Sales Job Openings': info.oneYearSalesJobOpenings,
  };
}
