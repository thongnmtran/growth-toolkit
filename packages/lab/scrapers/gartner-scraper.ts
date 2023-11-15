import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { mkConfig, generateCsv, asString } from 'export-to-csv';
import { Buffer } from 'node:buffer';
import axios from 'axios';
import { GartnerRoot, Review } from './garner-types';
import lodash from 'lodash';
import { default as csv } from 'csv-parser';
import { delay } from '../../common/utils/time-utils';

const { get } = lodash;

const csvConfig = mkConfig({ useKeysAsHeaders: true });

const saveData = async (data: any[] = [], name = 'data.csv') => {
  const csv = generateCsv(csvConfig)(data);
  const csvBuffer = new Uint8Array(Buffer.from(asString(csv)));
  await writeFile(name, csvBuffer);
};

const saveLikes = async (likes) => {
  await saveData(likes, 'data/gartner-likes.csv');
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

async function fetchReviews(from = 1, to = 1) {
  const filter = {
    products: [],
    reviewRating: [],
    partnerReview: [],
    companySize: [],
    industry: [],
    deploymentRegion: [],
    function: [],
    tags: [],
  };

  const res = await axios.get(
    `https://www.gartner.com/reviews/api2-proxy/reviews/market/vendor/filter?vendorSeoName=katalon&marketSeoName=ai-augmented-software-testing-tools&productSeoName=katalon&startIndex=${from}&endIndex=${to}&filters=${encodeURIComponent(
      JSON.stringify(filter)
    )}&sort=-review_date`,
    {
      headers: {
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.9,vi;q=0.8',
        authorization: '47169E89D766DBE7722639EF5A254',
        'cache-control': 'no-cache',
        'content-type': 'application/json',
        'pi-pathname':
          '/reviews/market/ai-augmented-software-testing-tools/vendor/katalon/product/katalon/reviews',
        pragma: 'no-cache',
        'sec-ch-ua':
          '"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        referrer:
          'https://www.gartner.com/reviews/market/ai-augmented-software-testing-tools/vendor/katalon/product/katalon/reviews?marketSeoName=ai-augmented-software-testing-tools&vendorSeoName=katalon&productSeoName=katalon&sort=-review_date',
        referrerPolicy: 'strict-origin-when-cross-origin',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
      },
    }
  );
  return res.data as GartnerRoot;
}

async function fetchReviewDetails(reviewId: string | number) {
  const uri = `https://www.gartner.com/reviews/market/ai-augmented-software-testing-tools/vendor/katalon/product/katalon/review/view/${reviewId}`;
  const res = await axios.get(uri, {
    headers: {
      accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'accept-language': 'en-US,en;q=0.9',
      'cache-control': 'no-cache',
      pragma: 'no-cache',
      'sec-ch-ua':
        '"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      Referer: uri,
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    },
  });

  const rawPage: string = res.data;
  // console.log('> rawPage:', rawPage.length);
  const matches = rawPage.match(
    /<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script/m
  );
  const [, rawReview] = matches ? [...matches] : [];
  // console.log('> rawReview:', rawReview?.length);
  const parsedReview = rawReview ? JSON.parse(rawReview) : null;
  const review = get(
    parsedReview,
    'props.pageProps.serverSideXHRData.getReviewPresentation.review'
  );
  review.reviewId = reviewId;
  return review;
}

function normalizeObject(object: object, prop: string, alias: string = prop) {
  const root = object[prop];
  const clone = {};

  if (!root || typeof root !== 'object') {
    return root;
  }

  Object.keys(root).forEach((key) => {
    const propValue = root[key];

    let finalKey = key;
    if (Array.isArray(root)) {
      finalKey =
        propValue['slug'] || propValue['title'] || propValue['key'] || key;
    }

    const newKey = `${alias}_${finalKey}`;
    if (typeof propValue === 'object') {
      clone[newKey] = normalizeObject(root, key, newKey);
    } else {
      clone[newKey] = propValue;
    }
  });

  Object.assign(object, clone);
  delete object[prop];
  return clone as any;
}

function normalizeDetailedReview(review: Review) {
  if (!review) {
    return review;
  }
  const clone: Review = { ...review };
  delete clone.market;
  delete clone.vendor;
  delete clone.products;
  const time = new Date(clone.submitDate);
  clone.submitTimestamp = time.getTime();
  clone.submitDate = `${time.getFullYear()}/${
    time.getMonth() + 1
  }/${time.getDate()}`;
  normalizeObject(clone, 'user');

  const sections = clone.sections || [];
  delete clone.sections;

  const clone2 = { ...clone } as any;
  sections.forEach((section) => {
    if (section.ratingValue) {
      clone2[section.slug || section.title || section.id] =
        +section.ratingValue;
    }
    if (section.questions) {
      section.questions.forEach((question) => {
        let questionValue: any = question.value;
        if (Array.isArray(questionValue)) {
          questionValue = questionValue.join(', ');
        }
        if (question.type === 'ratings') {
          questionValue = +questionValue;
        }
        clone2[question.key] = questionValue;
      });
    }
  });

  return clone2;
}

const info = await fetchReviews();
console.log('> Total reviews:', info.totalCount);

const data = await fetchReviews(1, info.totalCount);
const reviews = data.userReviews.map((reviewI) => {
  const review = {
    ...reviewI,
  };
  review.timestamp = new Date(reviewI.formattedReviewDate).getTime();
  delete review.tags;
  return review;
});
await saveReviews(reviews, 'gartner-reviews-2');

// ---

const cahedDataFile = 'data/gartner-full-reviews.csv';
const cached = await readFile(cahedDataFile, { encoding: 'utf-8' });
const cachedReviews: any[] = [];

await new Promise((resolve, reject) => {
  createReadStream(cahedDataFile)
    .pipe(csv())
    .on('data', (data) => cachedReviews.push(data))
    .on('end', () => {
      console.log(cachedReviews);
      resolve(cachedReviews);
    })
    .on('error', (error) => {
      reject(error);
    });
});

const fullReviews: any[] = [];
let counter = 0;
while (reviews.length) {
  const pureReviewI = reviews.shift();
  if (!pureReviewI) {
    break;
  }
  const existingReview = cachedReviews.find(
    (reviewI) => reviewI.summary === pureReviewI.reviewSummary
  );
  if (existingReview) {
    existingReview.reviewId = pureReviewI.reviewId;
    fullReviews.push(existingReview);
    console.log('> Review Loaded:', ++counter);
    const validReviews = fullReviews
      .map((reviewI) => normalizeDetailedReview(reviewI))
      .filter((reviewI) => reviewI);
    await saveReviews(validReviews, 'gartner-full-reviews-2');
    continue;
  }
  const fullReviewI = await fetchReviewDetails(pureReviewI.reviewId);
  if (fullReviewI) {
    console.log('> Review Fetched:', ++counter);
    fullReviews.push(fullReviewI);

    const validReviews = fullReviews
      .map((reviewI) => normalizeDetailedReview(reviewI))
      .filter((reviewI) => reviewI);
    await saveReviews(validReviews, 'gartner-full-reviews-2');
  } else {
    console.log('> Failed to fetch review:', pureReviewI.reviewId);
    reviews.unshift(pureReviewI);
  }
  await delay(7);
}
