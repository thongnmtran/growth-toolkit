/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnalysisModel } from '@growth-toolkit/common-models';
import { GPTService } from './GPTService';
import { CustomEventEmitter, Typed, delay } from '@growth-toolkit/common-utils';

export type AnalyzingChartData = {
  name: string;
  value: number;
}[];

export type AnalyzingStatistics = {
  total: number;
  analyzed: number;
  analyzedExceptNone: number;
  progress: number;
};

export type AnalyzingProgress = {
  statistics: AnalyzingStatistics;
  data: AnalyzingChartData;
};

export type AnalyzingProgressEvent = Typed<'progress'> & AnalyzingProgress;

export class DeepAnalyzer extends CustomEventEmitter<AnalyzingProgressEvent> {
  running = false;

  get statistics(): AnalyzingStatistics {
    const { excelFile } = this.model;
    const { rows } = excelFile;
    const total = rows.length;
    const analyzed = rows.filter((row: any) =>
      this.getRowCategories(row),
    ).length;
    const analyzedExceptNone = rows.filter((row: any) => {
      const rowCategories = this.getRowCategories(row);
      return rowCategories && !rowCategories.includes('None');
    }).length;
    const progress = Math.round((analyzed / total) * 100);
    return {
      total,
      analyzed,
      analyzedExceptNone,
      progress,
    };
  }

  get csvData() {
    const { excelFile } = this.model;
    const { rows } = excelFile;
    let categories = this.getAllCategories();
    if (this.model.noneExcluded) {
      categories = categories.filter((category) => category !== 'None');
    }
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
    let categories = this.getAllCategories();
    if (this.model.noneExcluded) {
      categories = categories.filter((category) => category !== 'None');
    }
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

    let currentConversationName =
      await this.gptService.getCurrentConversationName();

    if (!currentConversationName) {
      if (this.model.name) {
        const allConversationParts =
          await this.gptService.getAllConversationParts(this.model.name);
        if (allConversationParts.length <= 0) {
          const conversationName = `${this.model.name} - Part 1`;
          await this.gptService.newConversation(conversationName);
          currentConversationName = conversationName;
        } else {
          currentConversationName = allConversationParts[0]!.label;
        }
      } else {
        console.log('> Conversation name should not be empty');
        this.running = false;
        return;
      }
    }

    const allConversationParts = await this.gptService.getAllConversationParts(
      currentConversationName,
    );
    console.log('> All conversation parts:', allConversationParts);
    for (const conversation of allConversationParts) {
      console.log('> Goto conversation:', conversation.label);
      await this.gptService.gotoConversation(conversation.label);
      await delay('3s');
      await this.runAnalysis();
    }

    if (!this.running) {
      return;
    }
    const currentConversationNameNow =
      await this.gptService.getCurrentConversationName();
    await this.gptService.newConversationPart(currentConversationNameNow);
    await this.runAnalysis();
  }

  buildContract() {
    const rawCategories = `"${this.model.categories.join('", "')}"`;
    const contract = `Starting with my next message, each message will be a feedback. Please help categorize that feedbacks. Respond only with the category names, each category on one line. Respond with 'None' if the feedback is spam or meaningless; respond with 'Other' if no category matches. The given categories are: ${rawCategories}`;
    return contract;
  }

  async runAnalysis() {
    const contract = this.model.contract || this.buildContract();
    await this.gptService.contract(`>>> Contract: ${contract}`);

    let collectMode = this.model.mode === 'collect';

    if (await this.isContextOverflow()) {
      collectMode = true;
    }

    const patch = this.model.excelFile.rows.slice(0, 5);
    for (const row of patch) {
      const existingCategories = await this.detectAnalyzedCategories(row);
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
          if ((await this.isContextOverflow()) && this.model.sleepMode) {
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

    let reply = await this.gptService.ask(this.buildFeedbackContent(feedback));
    if (!this.running) {
      // The result might not be correct if the process is aborted
      return;
    }

    do {
      const matchedCategories = this.matchCategories(reply);
      if (matchedCategories.length === 0) {
        const allCategories = this.getAllCategories();
        const isReplying = allCategories.some((category) => {
          const lines = reply.split('\n');
          return lines.some(
            (line) =>
              category.startsWith(line) && line.length < category.length,
          );
        });
        if (isReplying) {
          reply = await this.gptService.getLastReply();
          await delay('1s');
          continue;
        }
      }
      if (matchedCategories.length === 0) {
        console.warn('> Cannot find category for:', feedback);
        console.warn('> Reply & Categories:', reply, allCategories);
        throw new Error('> Abort');
      } else {
        this.setRowCategories(row, matchedCategories.join('\n'));
      }
      // eslint-disable-next-line no-constant-condition
    } while (false);
  }

  async isContextOverflow() {
    const numReply = await this.gptService.getNumReplies();
    if (numReply < 10) {
      return false;
    }
    const lastReply = await this.gptService.getLastReply();
    if (!lastReply) {
      return false;
    }
    return this.matchCategories(lastReply).length === 0;
  }

  async detectAnalyzedCategories(row: any): Promise<string | null> {
    if (this.getRowCategories(row)) {
      return this.getRowCategories(row);
    }

    const feedback = this.getTargetField(row);
    if (this.isNoneValue(feedback)) {
      return 'None';
    }

    await delay('100ms');
    const existingReply = this.gptService.findQuestion(
      this.buildFeedbackContent(feedback),
    );
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

  buildFeedbackContent(feedback: string) {
    return `Feedback: ${feedback}`;
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
      strongNoneValues.some((strongNoneValue) =>
        value.toLowerCase().includes(strongNoneValue.toLowerCase()),
      )
    );
  }
}
