/* eslint-disable @typescript-eslint/no-explicit-any */
import { mkConfig, generateCsv, asString } from 'export-to-csv';
import { ClipboardUtils } from './clipboard-utils';
import { exposeAPI } from '@/helpers/automator';
import { normalizeRows } from './normalizeRows';

export function copyExcelFile(data: any[] = []) {
  const csvConfig = mkConfig({
    useKeysAsHeaders: true,
    fieldSeparator: '\t',
    quoteStrings: false,
  });
  const csv = generateCsv(csvConfig)(normalizeRows(data));

  // const csvBuffer = new Uint8Array(Buffer.from(asString(csv)));
  const rawCSV = asString(csv);
  // console.log(rawCSV);
  ClipboardUtils.copy(rawCSV);
}

exposeAPI('copyExcelFile', copyExcelFile);
