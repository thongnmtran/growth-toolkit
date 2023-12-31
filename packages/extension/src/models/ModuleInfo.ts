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
  quality?: number;
  completenessLevel?: number;
};

export type MaslowAttributes = {
  physiological?: number; // I can do my job
  safety?: number; // I can do my job without fear
  love?: number; // I can do my job with love
  esteem?: number; // I can do my job with respect
  selfActualization?: number; // I can do my job with self-actualization
};

export type UserSegment = {
  name: string; // Beginner, Intermediate, Advanced, Expert; Free, Trial, Paid
  licenseType?: LicenseType;
  testingExperience?: ExperienceLevel;
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

  awarenessRatio?: number; // % of users who know about the feature
  monthlyRetention?: number;
  satisfaction?: number; // 1-10
  interestRatio?: number; // % of users who are interested in the feature
};

export enum OpportunityType {
  WON_DEAL = 'WON_DEAL',
  WON_COMPANY = 'WON_COMPANY',
  LOST_DEAL = 'LOST_DEAL',
  LOST_COMPANY = 'LOST_COMPANY',
  COMMITTED_DEAL = 'COMMITTED_DEAL',
  COMMITTED_COMPANY = 'COMMITTED_COMPANY',
  RISK_DEAL = 'RISK_DEAL',
  RISK_COMPANY = 'RISK_COMPANY',
  CHURNED_DEAL = 'CHURNED_DEAL',
  CHURNED_COMPANY = 'CHURNED_COMPANY',
  ACCQUIRABLE_DEAL = 'ACCQUIRABLE_DEAL',
  ACCQUIRABLE_COMPANY = 'ACCQUIRABLE_COMPANY',
  ACCQUIRABLE_MARKET = 'ACCQUIRABLE_MARKET',
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

export type Competitor = {
  name: string;
  type: 'DIRECT' | 'INDIRECT';
  links: string[];
  description?: string;
};

export type CompetitorRecord = {
  name: Competitor['name'];
  completenessLevel: number; // 1-10
  comparison: string;
  licenseType: LicenseType;
};

export type ModuleInfo = {
  id: string;
  order: number;
  name: string;
  description?: string;
  whenToUse?: string;
  docs: string[];
  basicAttributes: BasicModuleAttributes;
  maslowAttributes: MaslowAttributes;
  usages: UsageGroup[];
  opportunities: Opportunity[];
  competitors: CompetitorRecord[];
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
    maslowAttributes: {},
    docs: [],
    usages: [],
    opportunities: [],
    competitors: [],
    otherFactors: {},
  };
}
