/* eslint-disable @typescript-eslint/no-explicit-any */

import { IntRange } from '@growth-toolkit/common-utils';

export enum LicenseType {
  ANY = 'ANY',
  NOT_SET = 'NOT_SET',
  FREE = 'FREE',
  PAID = 'PAID',
}

export enum ExperienceLevel {
  ANY = 'ANY',
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

export type BasicModuleAttributes = {
  licenseType: LicenseType;
  volumable: boolean;
  supported: boolean;
  betterToBe?: LicenseType;
};

export type UserSegment = {
  name: string; // Beginner, Intermediate, Advanced, Expert; Free, Trial, Paid
  licenseType?: LicenseType;
  userExperience?: ExperienceLevel;
  katalonExperience?: ExperienceLevel;
  katalonAge?: number; // Number of days since the first time the user used Katalon Studio
  averageTeamSize?: number;
};

export type UsageGroup = {
  userSegment?: UserSegment;
  userSegmentId?: string;

  needMaturity?: IntRange<1, 10>;
  startUsingDay?: number;
  monthlyUsage?: number;
};

export enum OpportunityType {
  WON_DEAL = 'WON_DEAL',
  LOST_DEAL = 'LOST_DEAL',
  LOST_COMPANY = 'LOST_COMPANY',
  LOST_MARKET = 'LOST_MARKET',
  CHURNED_DEAL = 'CHURNED_DEAL',
  CHURNED_COMPANY = 'CHURNED_COMPANY',
  CHURNED_MARKET = 'CHURNED_MARKET',
  ACCQUIRABLE_DEAL = 'ACCQUIRABLE_DEAL',
  ACCQUIRABLE_COMPANY = 'ACCQUIRABLE_COMPANY',
  ACCQUIRABLE_MARKET = 'ACCQUIRABLE_MARKET',
  COMMITTED_DEAL = 'COMMITTED_DEAL',
  COMMITTED_COMPANY = 'COMMITTED_COMPANY',
  COMMITTED_MARKET = 'COMMITTED_MARKET',
  RISK_DEAL = 'RISK_DEAL',
  RISK_COMPANY = 'RISK_COMPANY',
}

export type Opportunity = {
  type: OpportunityType;
  name: string;
  amount: number;
  numKSELicenses: number;
  numKRELicenses: number;
  accountId: string;
  links: string[];
  time: number;
};

export type ModuleInfo = {
  id: string;
  order: number;
  name: string;
  description?: string;
  whenToUse?: string;
  docs: string[];
  basicAttributes: BasicModuleAttributes;
  usages: UsageGroup[];
  opportunities: Opportunity[];
  otherFactors: Record<string, any>;
};

export function generateDefaultModuleInfo(): ModuleInfo {
  return {
    id: '',
    order: 0,
    name: '',
    description: '',
    whenToUse: '',
    basicAttributes: {
      supported: true,
      volumable: false,
      licenseType: LicenseType.FREE,
      betterToBe: LicenseType.NOT_SET,
    },
    docs: [],
    usages: [],
    opportunities: [],
    otherFactors: {},
  };
}
