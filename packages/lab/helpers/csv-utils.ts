import { default as csv } from 'csv-parser';
import { createReadStream } from 'fs';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { mkConfig, generateCsv, asString } from 'export-to-csv';

export async function saveData(data: any[] = [], name = 'data.csv') {
  const csvConfig = mkConfig({ useKeysAsHeaders: true });
  const csv = generateCsv(csvConfig)(data);
  const csvBuffer = new Uint8Array(Buffer.from(asString(csv)));
  await writeFile(name, csvBuffer);
}

function normalizeRecord(record: object) {
  return Object.entries(record).reduce((acc, [key, value]) => {
    const normalizedKey = key
      .trim()
      .replace('﻿', '')
      .replace(/"'/g, '')
      .toLowerCase();
    const normalizedValue = value.trim();
    return { ...acc, [normalizedKey]: normalizedValue };
  }, {});
}

export async function readCSV(filePath: string): Promise<any[]> {
  const rows: any[] = [];

  return new Promise((resolve, reject) => {
    createReadStream(filePath)
      .pipe(csv({}))
      .on('data', (data) => rows.push(normalizeRecord(data)))
      .on('end', () => {
        console.log('> Num rows:', rows.length);
        resolve(rows);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

// const data = await readCSV('data/sample data - survey_send_comment - Trang tính1.csv');

// const feedbacks = data
//   .map(row => row.feedback)
//   .filter(feedback => feedback)
//   .map(feedback => (feedback as string)
//     .replace(/\r\n|\n/gm, '. ')
//     .replace(/\.{2}/gm, '.')
//     .replace(/NA|na|n\\a|N\\A/gm, 'nothing')
//   )
//   .map(feedback => ({ feedback }));

// await saveData(feedbacks, 'data/exit-feedbacks.csv');
// console.log(feedbacks.length);
