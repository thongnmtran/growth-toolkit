/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnalysisModel } from '@/models/AnalysisModel';
import { GPTService } from './GPTService';
import { CustomEventEmitter, Typed } from '@katalon-toolbox/common-utils';

export type AnalyzingChartData = {
  name: string;
  value: number;
}[];

export type AnalyzingProgress = {
  total: number;
  analyzed: number;
  progress: number;
  data: AnalyzingChartData;
};

export type AnalyzingProgressEvent = Typed<'progress'> & AnalyzingProgress;

export class DeepAnalyzer extends CustomEventEmitter<AnalyzingProgressEvent> {
  running = false;

  get statistics() {
    const { excelFile } = this.model;
    const { rows } = excelFile;
    const total = rows.length;
    const analyzed = rows.filter((row: any) => !!row.categories).length;
    const progress = Math.round((analyzed / total) * 100);
    return {
      total,
      analyzed,
      progress,
    };
  }

  get chartData() {
    const { excelFile } = this.model;
    const { rows } = excelFile;
    const categories = this.getAllCategories();
    const data = categories.map((category) => {
      const count = rows.filter((row: any) => {
        const rowCategories = this.getRowCategories(row);
        return rowCategories && rowCategories.includes(category);
      }).length;
      return {
        name: category,
        value: count,
      };
    });
    return data;
  }

  emitProgress() {
    try {
      this.emitEvent({
        type: 'progress',
        data: this.chartData,
        ...this.statistics,
      });
      // console.log('> Chart data:', this.chartData);
      console.log('> Statistics:', this.statistics);
    } catch (error) {
      console.warn('> Emit progress error:', error);
    }
  }

  constructor(
    public model: AnalysisModel,
    public gptService: GPTService,
  ) {
    super();
  }

  async start() {
    console.log('> Start Deep Analysis');
    this.running = true;

    const rawCategories = `"${this.model.categories.join('", "')}"`;
    const contract = `Given the categories below, please categorize all the following pieces of feedback. Reply only with the category names; each category in one line; respond with 'None' if the feedback is spam or meaningless, and 'Other' if no category matches. The given categories are: ${rawCategories}`;
    await this.gptService.contract(contract);

    const collectMode = this.model.mode === 'collect';

    const patch = this.model.excelFile.rows.slice(0);
    for (const row of patch) {
      const existingCategories = this.isAnalyzed(row);
      if (existingCategories) {
        this.setRowCategories(row, existingCategories);
        console.log('> Already analyzed:', row);
        this.emitProgress();
        continue;
      }
      if (!collectMode) {
        await this.analyze(row);
        this.emitProgress();
      }
      if (!this.running) {
        break;
      }
    }
  }

  async stop() {
    if (!this.running) {
      return;
    }
    this.running = false;
    await this.gptService.abort();
  }

  async analyze(row: any) {
    console.log('> Analyzing:', row);

    const feedback = this.getTargetField(row);
    const allCategories = this.getAllCategories();

    const reply = await this.gptService.ask(feedback);
    if (!this.running) {
      // The result might not be correct if the process is aborted
      return;
    }

    const matchedCategories = this.matchCategories(reply);

    if (!matchedCategories || matchedCategories.length === 0) {
      console.warn('> Cannot find category for:', feedback);
      console.warn('> Reply & Categories:', reply, allCategories);
      throw new Error('> Abort');
    } else {
      this.setRowCategories(row, matchedCategories.join('\n'));
    }
  }

  matchCategories(reply: string): string[] {
    const allCategories = this.getAllCategories();
    const matchedCategories = allCategories.filter((category) =>
      reply.toLowerCase().includes(category.toLowerCase()),
    );
    return matchedCategories;
  }

  isAnalyzed(row: any): string | null {
    if (this.getRowCategories(row)) {
      return this.getRowCategories(row);
    }

    const feedback = this.getTargetField(row);
    const existingReply = this.gptService.findQuestion(feedback);
    if (!existingReply) {
      return null;
    }

    const matchedCategories = this.matchCategories(existingReply);
    const isCorrectAnalyzed = matchedCategories && matchedCategories.length > 0;
    if (isCorrectAnalyzed) {
      return matchedCategories.join('\n');
    }

    const isLastReply = this.gptService.isLastQuestion(feedback);
    if (isLastReply) {
      const allCategories = this.getAllCategories();
      console.warn('> Cannot find category for:', feedback);
      console.warn('> Reply & Categories:', existingReply, allCategories);
      throw new Error('> Abort');
    }

    return null;
  }

  getRowCategories(row: any): string | null {
    return row.categories;
  }

  setRowCategories(row: any, categories: string) {
    row.categories = categories;
  }

  getTargetField(row: any): string {
    const { targetField } = this.model;
    const { [targetField]: feedback } = row;
    return feedback;
  }

  getAllCategories(): string[] {
    const { categories } = this.model;
    return categories.concat(['None', 'Other']);
  }
}
