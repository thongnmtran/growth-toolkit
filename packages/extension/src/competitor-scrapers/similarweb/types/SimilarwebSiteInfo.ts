import { SimilarwebCompanyInfo } from './SimilarwebCompanyInfo';
import { SimilarwebEngagement } from './SimilarwebEngagement';
import { SimiarwebRanks } from './SimilarwebRanks';
import { SimilarwebTraffic } from './SimilarwebSiteTraffic';
import { SimilarwebTopKeyword } from './SimilarwebTopKeyword';
import { SimilarwebTrafficByCountry } from './SimilarwebTrafficByCountry';

export type SimiarwebSiteInfo = {
  companyInfo: SimilarwebCompanyInfo;
  ranks: SimiarwebRanks;
  engagement: SimilarwebEngagement;
  traffic: SimilarwebTraffic;
  trafficByCountry: SimilarwebTrafficByCountry[];
  topKeywords: SimilarwebTopKeyword[];
};
