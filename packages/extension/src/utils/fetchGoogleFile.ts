import { FetchResponse, Fetcher } from '@/transports/Fetcher';
import { fetcher } from '../helpers/fetcher';
import contentDisposition from 'content-disposition';
import { ExcelFile, FileData, FileInfo } from '@growth-toolkit/common-models';
import { parseExcelFile } from './parseExcelFile';

export async function fetchGoogleSheet(
  uri: string,
  customFetcher?: Fetcher,
): Promise<ExcelFile> {
  const file = await fetchGoogleFile(uri, customFetcher);
  const excel = parseExcelFile(file);
  return excel;
}

/**
 * https://drive.google.com/file/d/1od4smtJCV5w8cX5B9UqPIj_einxd4Db8/view?usp=sharing
 * https://docs.google.com/spreadsheets/d/1ssCIbqMsPyNUXIIOYbIPbEpMAzuel4jaElqGdKRzl2c/edit#gid=339147078
 */
export async function fetchGoogleFile(
  uri: string,
  customFetcher?: Fetcher,
): Promise<FileData> {
  const docId = parseDocId(uri);
  const sheetId = parseSheetId(uri);

  const isSpreadsheet = uri.includes('spreadsheets');
  const directLink = docId
    ? buildDirectLink({ docId, sheetId, isSpreadsheet })
    : uri;
  console.log('> directLink', directLink);

  const fetcherz = customFetcher || fetcher;
  const res = await fetcherz.fetch(directLink);
  const fileInfo = extractFileInfo(res);
  fileInfo.uri = uri;

  return {
    info: fileInfo,
    text: res.text,
    json: res.json,
  };
}

export function extractFileInfo(res: FetchResponse): FileInfo {
  const rawContentDisposition = res.headers['content-disposition'];
  if (!rawContentDisposition) {
    return {
      createdTime: Date.now(),
      name: 'Data file',
      uri: res.url,
    };
  }
  const info = contentDisposition.parse(rawContentDisposition);
  const filename = info.parameters['filename'];
  return {
    name: filename || 'Data file',
    uri: res.url,
    createdTime: Date.now(),
  };
}

export function buildDirectLink(options: {
  docId: string;
  sheetId?: string;
  isSpreadsheet?: boolean;
}) {
  const { docId, sheetId, isSpreadsheet = false } = options;
  return isSpreadsheet
    ? `https://docs.google.com/spreadsheets/d/${docId}/export?exportFormat=csv&&id=${docId}${
        sheetId ? `&gid=${sheetId}` : ''
      }`
    : // ? `https://spreadsheets.google.com/feeds/download/spreadsheets/Export?key=${docId}&exportFormat=csv`
      `https://drive.google.com/uc?export=download&id=${docId}`;
}

export function parseDocId(uri: string) {
  return uri.split('/')[5];
}

export function parseSheetId(uri: string) {
  const gidParam = new URL(uri).searchParams.get('gid');
  if (gidParam) {
    return gidParam;
  }
  const gidHash = new URL(uri).hash.match(/\bgid=(\d+)/)?.[1];
  return gidHash || undefined;
}
