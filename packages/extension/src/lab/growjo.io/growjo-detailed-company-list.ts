import { parseExcelFile } from '../../utils/parseExcelFile';
import { readFile } from 'node:fs/promises';

const companyList = await readFile('data/growjo-company-list.csv');
const companies = await parseExcelFile({
  text: companyList.toString('utf-8'),
  info: {} as never,
  json: {},
});

console.log(companies);
