import { copyExcelFile } from '@/utils/copyExcelFile';
import { Competitor } from './competitor-scraper-types';
import { delay } from '@growth-toolkit/common-utils';

export async function exportCompetitors(params: {
  competitors: Competitor[];
  foundCompetitors: string[];
  foundDirectCompetitors: string[];
}) {
  const { competitors, foundCompetitors, foundDirectCompetitors } = params;
  console.log(competitors);

  const data = competitors.map((competitor) => {
    const clone = {
      ...competitor,
      rating: competitor.reviews[0]?.rating,
      reviewsCount: competitor.reviews[0]?.count,
      reviewsUrl: competitor.reviews[0]?.url,
      reviews: undefined,
      // isTestingTool: foundTestingTools.includes(competitor.name),
      isCompetitor: foundCompetitors.includes(competitor.name),
      isDirectCompetitor: foundDirectCompetitors.includes(competitor.name),
    };
    delete clone.reviews;
    return clone;
  });

  console.log('> Copying CSV file...');
  await delay('3s');
  console.log('> File copied!');

  copyExcelFile(data);
}
