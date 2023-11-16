/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExcelFile } from '@/models/ExcelFile';
import { FileData } from '@/models/FileData';
import { default as csv } from 'csv-parser';

export async function parseExcelFile(file: FileData): Promise<ExcelFile> {
  const parser = csv();
  const rows: any[] = [];

  await new Promise<void>((resolve, reject) => {
    parser.on('data', (data) => {
      rows.push(data);
    });

    parser.on('finish', () => {
      console.log('Finished parsing CSV file');
      resolve();
    });

    parser.on('end', () => {
      console.log('Finished parsing CSV file');
      resolve();
    });

    parser.on('drain', () => {
      console.log('Drained CSV file');
      resolve();
    });

    parser.on('error', (error) => {
      console.error('Error parsing CSV file', error);
      reject(error);
    });

    parser.write(file.text, 'utf-8');

    resolve();
  });

  console.log('Parsed CSV file', rows);

  return {
    ...file,
    numRows: rows.length,
    rows,
    headers: Object.keys(rows[0]),
  };
}
