import { FetchResponse } from '@/transports/Fetcher';
import { fetcher } from './fetcher';
import contentDisposition from 'content-disposition';
import { FileData, FileInfo } from '@growth-toolkit/common-models';

/**
 * https://drive.google.com/file/d/1od4smtJCV5w8cX5B9UqPIj_einxd4Db8/view?usp=sharing
 * https://docs.google.com/spreadsheets/d/1jUtCH2EKO63O2WgBWgBd_CfKaIo-Y_hwjsyF8jyNTtA/edit?usp=drive_link
 */
export async function fetchGoogleFile(uri: string): Promise<FileData> {
  const docId = parseDocId(uri);

  const isSpreadsheet = uri.includes('spreadsheets');
  const directLink = docId ? buildDirectLink(docId, isSpreadsheet) : uri;

  const res = await fetcher.fetch(directLink);
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

export function buildDirectLink(docId: string, isSpreadsheet = false) {
  return isSpreadsheet
    ? `https://docs.google.com/spreadsheets/d/${docId}/export?exportFormat=csv`
    : // ? `https://spreadsheets.google.com/feeds/download/spreadsheets/Export?key=${docId}&exportFormat=csv`
      `https://drive.google.com/uc?export=download&id=${docId}`;
}

export function parseDocId(uri: string) {
  return uri.split('/')[5];
}
