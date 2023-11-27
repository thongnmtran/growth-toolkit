/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { mkdir, writeFile } from 'node:fs/promises';
import { mkConfig, generateCsv, asString } from 'export-to-csv';

const csvConfig = mkConfig({ useKeysAsHeaders: true });

const saveData = async (data: any[] = [], name = 'data.csv') => {
  const csv = generateCsv(csvConfig)(data);
  const csvBuffer = new Uint8Array(Buffer.from(asString(csv)));
  await writeFile(name, csvBuffer);
};

const saveReviews = async (reviews: any[] = [], name = 'gartner-reviews') => {
  if (reviews.length === 0) {
    return;
  }
  try {
    await mkdir('data', { recursive: true });
    await saveData(reviews, `data/${name}.csv`);
  } catch (error) {
    console.log('> Save error', error);
  }
};

async function fetchPage(after = 'null') {
  const res = await axios.post(
    'https://graphql.capterra.com/api',
    `{"query":"query fetchMoreReviews($productId:ID!$categorySlug:String$countryCode:String!$reviewsToFetch:Int=5$filter:TextReviewFilter$sort:TextReviewSort=MOST_HELPFUL$after:String=null){capterra{product(categorySlug:$categorySlug countryCode:$countryCode id:$productId){textReviews(first:$reviewsToFetch filter:$filter sort:$sort after:$after){pageInfo{endCursor hasNextPage}edges{node{vendorReply{text vendorName writtenOn}recommendationRating alternativesConsidered(first:5){edges{node{name slug id}}totalCount}switchedProducts(first:5){edges{node{name slug id}}}cons pros customerSupportRating easeOfUseRating functionalityRating valueForMoneyRating generalComments id incentivized overallRating reasonForChoosing reasonForSwitching reviewerFirstName reviewerIndustry reviewerLastName reviewerCompanySize timeUsedProduct sourceSite reviewerJobTitle writtenOn title globalReviewId isAuthenticated reviewerAnonymityOn profilePictureUrl adviceToOthers completenessScore}}}}}}","variables":{"reviewsToFetch":25,"categorySlug":"automated-testing-software","countryCode":"VN","productId":235574,"after":${after},"filter":{},"sort":"MOST_RECENT"}}`,
    {
      headers: {
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.9,vi;q=0.8',
        'content-type': 'application/json',
        'sec-ch-ua': `"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"`,
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': `"Windows"`,
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        Referer: 'https://www.capterra.com/',
        'referrer-policy': 'origin-when-cross-origin',
      },
    },
  );
  return res.data.data;
}

function resolveNode(node: any) {
  try {
    const row = {
      ...node,
    };
    delete row.alternativesConsidered;
    delete row.switchedProducts;
    row.alternativesConsidered = node.alternativesConsidered.edges
      .filter((edge: any) => edge.node)
      .map((edge: any) => edge.node.name)
      .join(', ');
    row.switchedProducts = node.switchedProducts.edges
      .filter((edge: any) => edge.node)
      .map((edge: any) => edge.node.name)
      .join(', ');
    return row;
  } catch (error) {
    console.error('> Error', error);
    throw error;
  }
}

const allData = [];
let after = 'null';
let data;

do {
  try {
    data = await fetchPage(after);
    console.log(`> ${after}:`, data);
    allData.push(
      ...data.capterra.product.textReviews.edges.map((row: any) =>
        resolveNode(row.node),
      ),
    );
    after = `"${data.capterra.product.textReviews.pageInfo.endCursor}"`;
  } catch (error) {
    console.log('> Error', error);
    throw error;
  }
} while (data?.capterra.product.textReviews.pageInfo.hasNextPage);

console.log(allData);

await saveReviews(allData, 'capterra-reviews');
