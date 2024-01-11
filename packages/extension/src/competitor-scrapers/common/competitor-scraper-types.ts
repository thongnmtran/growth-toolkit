export enum TestingType {
  AUTOMATION = 'AUTOMATION',
  VISUAL = 'VISUAL',
  PERFORMANCE = 'PERFORMANCE',
  LOAD = 'LOAD', // STRETCH
}

export enum AppType {
  WEB = 'WEB',
  DESKTOP = 'DESKTOP',
  MOBILE = 'MOBILE',
  API = 'API',
}

export type Competitor = {
  name: string;
  url: string;
  company?: string;
  description?: string;
  pricingPage?: string;
  freeVersion?: boolean;
  freeTrial?: boolean;
  openSource?: boolean;
  revenue?: number;
  numEmployees?: number | [number, number];
  investments?: {
    loan?: number;
    A?: number;
    B?: number;
    C?: number;
  };
  investorsCount?: number;
  supportedTestingTypes?: TestingType[];
  supportedAppTypes?: AppType[];
  mentionedInSales?: boolean;
  mentionedInSupport?: boolean;
  numFollowers?: number;
  reviews: {
    name: string;
    url: string;
    rating: number;
    count: number;
  }[];
};
