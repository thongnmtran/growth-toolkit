/* eslint-disable @typescript-eslint/no-explicit-any */
import { Awaitable } from '@growth-toolkit/common-utils';

export type ScrapingProgress = {
  name: string;
  total: number;
  current: number;
  row: any;
};

export type ProgressListener = (progress: ScrapingProgress) => unknown;

export type ScrapingHandlerParams = {
  row: any;
  tabId: number;
  name: string;
};
export type ScrapingHandler = (params: ScrapingHandlerParams) => unknown;

export type ScrapingJob = {
  name: string;
  handler: ScrapingHandler;
  onProgress: ProgressListener;
};

export class ScraperManager {
  rows: any[] = [];
  jobs: ScrapingJob[] = [];
  running: boolean = false;
  tabProvider!: () => Awaitable<number>;

  schedule(job: ScrapingJob) {
    this.jobs.push(job);
  }

  async run() {
    this.running = true;
    await Promise.allSettled(
      this.jobs.map(async (job) => {
        const tabId = await this.tabProvider();
        const total = this.rows.length;
        let current = 0;
        for (const row of this.rows) {
          current++;
          job.onProgress({ total, current, row, name: job.name });
          await job.handler({
            row,
            tabId,
            name: job.name,
          });
          if (!this.running) {
            break;
          }
        }
      }),
    );
  }

  stop() {
    this.running = false;
  }
}
