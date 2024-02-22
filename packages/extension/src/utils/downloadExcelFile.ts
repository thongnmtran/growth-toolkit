/* eslint-disable @typescript-eslint/no-explicit-any */
import { mkConfig, generateCsv, asString } from 'export-to-csv';
import { download } from './FileUtil';
import { normalizeRows } from './normalizeRows';

export function downloadExcelFile(data: any[] = [], name = 'data.csv') {
  const csvConfig = mkConfig({ useKeysAsHeaders: true });
  const csv = generateCsv(csvConfig)(normalizeRows(data));

  const csvBuffer = new Uint8Array(Buffer.from(asString(csv)));
  download(csvBuffer, name, 'text/csv');
}
