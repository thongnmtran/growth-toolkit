import { saveCsvData } from '../../node-utils/saveCsvData';
import axios from 'axios';

async function fetchData(offset: number = 0, limit: number = 10000) {
  const res = await axios.get(
    `https://growjo.com/api/companies/industry?order=asc&orderBy=industryRanking&industry=Tech+Services&offset=${offset}&rowsPerPage=${limit}&filter=%7B%7D`,
    {
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9',
        auth: 'Basic Z3Jvd2pvQXBpVXNlcjpqazYhNVo5UHViQi5Idlo=',
        'sec-ch-ua':
          '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        Referrer: 'https://growjo.com/search',
        'referrer-policy': 'strict-origin-when-cross-origin',
      },
    },
  );

  return res.data?.data;
}

const data = await fetchData();

await saveCsvData(data, 'growjo-tech-services.csv');

console.log('> Done!', data.length);
