/* eslint-disable @typescript-eslint/no-explicit-any */
import { mkdir, writeFile } from 'node:fs/promises';
import { mkConfig, generateCsv, asString } from 'export-to-csv';

const csvConfig = mkConfig({ useKeysAsHeaders: true });

export async function saveCsvData(data: any[] = [], name = 'data.csv') {
  const csv = generateCsv(csvConfig)(data);
  await mkdir('data', { recursive: true });
  const csvBuffer = new Uint8Array(Buffer.from(asString(csv)));
  await writeFile(`data/${name}`, csvBuffer);
}
