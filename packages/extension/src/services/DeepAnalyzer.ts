/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnalysisModel } from '@/models/AnalysisModel';
import { GPTService } from './GPTService';
import {
  CustomEventEmitter,
  Typed,
  delay,
} from '@katalon-toolbox/common-utils';
import { findElement, findElements } from '@/helpers/automator';

export type AnalyzingChartData = {
  name: string;
  value: number;
}[];

export type AnalyzingStatistics = {
  total: number;
  analyzed: number;
  progress: number;
};

export type AnalyzingProgress = {
  statistics: AnalyzingStatistics;
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

  get csvData() {
    const { excelFile } = this.model;
    const { rows } = excelFile;
    const categories = this.getAllCategories();
    const data = rows.map((row: any) => {
      const newRow = { ...row };
      categories.forEach((category) => {
        newRow[category] = row.categories?.split('\n').includes(category)
          ? 'true'
          : 'false';
      });
      return newRow;
    });
    return data;
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
        statistics: this.statistics,
      });
      // console.log('> Chart data:', this.chartData);
      // console.log('> Statistics:', this.statistics);
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

    const currentConversationName =
      await this.gptService.getCurrentConversationName();

    if (currentConversationName) {
      const allConversationParts =
        await this.gptService.getAllConversationParts(currentConversationName);
      console.log('> All conversation parts:', allConversationParts);
      for (const conversation of allConversationParts) {
        console.log('> Goto conversation:', conversation.label);
        await this.gptService.gotoConversation(conversation.label);
        await delay('3s');
        await this.runAnalysis();
      }

      // New conversation

      return;
    }
  }

  async runAnalysis() {
    const rawCategories = `"${this.model.categories.join('", "')}"`;
    const contract = `Given the categories below, please categorize all the following pieces of feedback. Reply only with the category names; each category in one line; respond with 'None' if the feedback is spam or meaningless, and 'Other' if no category matches. The given categories are: ${rawCategories}`;
    await this.gptService.contract(contract);

    let collectMode = this.model.mode === 'collect';

    if (this.isContextOverflow()) {
      collectMode = true;
    }

    const patch = this.model.excelFile.rows.slice(0);
    for (const row of patch) {
      const existingCategories = this.detectAnalyzedCategories(row);
      if (existingCategories) {
        this.setRowCategories(row, existingCategories);
        // console.log('> Already analyzed:', row);
        this.emitProgress();
        continue;
      }
      if (!collectMode) {
        try {
          await this.analyze(row);
          this.emitProgress();
        } catch (error) {
          if (this.isContextOverflow() && this.model.sleepMode) {
            const currentConversationName =
              await this.gptService.getCurrentConversationName();
            await this.gptService.newConversationPart(currentConversationName);

            if (!this.running) {
              break;
            }

            setTimeout(() => {
              this.runAnalysis();
            }, 0);
            break;
          } else {
            throw error;
          }
        }
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
    if (matchedCategories.length === 0) {
      console.warn('> Cannot find category for:', feedback);
      console.warn('> Reply & Categories:', reply, allCategories);
      throw new Error('> Abort');
    } else {
      this.setRowCategories(row, matchedCategories.join('\n'));
    }
  }

  isContextOverflow(): boolean {
    const numReply = findElements(
      'div[data-testid*="conversation-turn-"]',
    ).length;
    if (numReply < 10) {
      return false;
    }
    const lastReply = findElement(
      'div[data-testid*="conversation-turn-"]:last-of-type',
    );
    if (!lastReply) {
      return false;
    }
    const lastReplyText = lastReply.textContent?.trim() || '';
    return this.matchCategories(lastReplyText).length === 0;
  }

  detectAnalyzedCategories(row: any): string | null {
    if (this.getRowCategories(row)) {
      return this.getRowCategories(row);
    }

    const feedback = this.getTargetField(row);
    if (this.isNoneValue(feedback)) {
      return 'None';
    }

    const existingReply = this.gptService.findQuestion(feedback);
    if (!existingReply) {
      return null;
    }

    const matchedCategories = this.matchCategories(existingReply);
    const isCorrectAnalyzed = matchedCategories.length > 0;
    if (isCorrectAnalyzed) {
      return matchedCategories.join('\n');
    }

    return null;
  }

  matchCategories(reply: string): string[] {
    const allCategories = this.getAllCategories();
    const matchedCategories = allCategories.filter((category) =>
      reply.toLowerCase().includes(category.toLowerCase()),
    );
    return matchedCategories;
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

  isNoneValue(value: string): boolean {
    const { noneValues, strongNoneValues } = this.model;
    return (
      !value ||
      value.length <= 2 ||
      noneValues.some(
        (noneValue) =>
          noneValue.toLowerCase().trim() === value.toLowerCase().trim(),
      ) ||
      strongNoneValues.includes(value)
    );
  }
}
