/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AnalysisSessionDoc,
  buildContract,
  buildNoneValues,
} from '@growth-toolkit/common-models';
import { GPTService } from './GPTService';
import { CustomEventEmitter, Typed, delay } from '@growth-toolkit/common-utils';
import { isNoneValue } from '@/utils/isNoneValue';

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

export type RowAnalyzedEvent = Typed<'row-analyzed'> & {
  row: any;
  session: AnalysisSessionDoc;
};

export type AnalyzerEvent = AnalyzingProgressEvent | RowAnalyzedEvent;

export class DeepAnalyzer extends CustomEventEmitter<AnalyzerEvent> {
  running = false;

  get statistics(): AnalyzingStatistics {
    const { excelFile } = this.model;
    if (!excelFile) {
      return {
        analyzed: 0,
        analyzedExceptNone: 0,
        total: 0,
        progress: 0,
      };
    }

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

  get statisticsCsvData() {
    const data = this.chartData;
    const pureStatistics = this.statistics;
    if (!data || !pureStatistics) {
      return;
    }

    const denominator = !this.model.noneExcluded
      ? pureStatistics.total
      : pureStatistics.analyzedExceptNone;
    let statistics = data.map((item) => {
      return {
        Category: item.name,
        Volume: item.value,
        Percentage: item.value / denominator,
      };
    });

    if (this.model.isCategorizedField) {
      statistics = statistics.filter((item) => item.Category !== 'Other');
    }
    if (this.model.noneExcluded) {
      statistics = statistics.filter((item) => item.Category !== 'None');
    }

    const other = statistics.find((item) => item.Category === 'Other');
    const otherVolume = other ? other.Volume : 0;
    if (other) {
      other.Volume = -1;
    }

    const none = statistics.find((item) => item.Category === 'None');
    const noneVolume = none ? none.Volume : 0;
    if (none) {
      none.Volume = -1;
    }

    statistics = statistics.sort((a, b) => {
      return b.Volume - a.Volume;
    });

    if (other) {
      other.Volume = otherVolume;
    }
    if (none) {
      none.Volume = noneVolume;
    }

    const sumVolume = statistics.reduce((prev, curr) => {
      return prev + curr.Volume;
    }, 0);

    const sumPercentage = statistics.reduce((prev, curr) => {
      return prev + curr.Percentage;
    }, 0);

    statistics.unshift({
      Category: 'Total',
      Volume: denominator,
      Percentage: 1,
    });

    statistics.push({
      Category: 'Sum',
      Volume: sumVolume,
      Percentage: sumPercentage,
    });

    statistics.forEach((item) => {
      item.Percentage = +item.Percentage.toFixed(2);
    });

    return statistics;
  }

  get csvData() {
    const { excelFile } = this.model;
    if (!excelFile) {
      return [];
    }

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
    if (!excelFile) {
      return [];
    }

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

  emitAnalyzedRow(row: any) {
    try {
      this.emitEvent({
        type: 'row-analyzed',
        row,
        session: this.sesion,
      });
    } catch (error) {
      console.warn('> Emit analyzed row error:', error);
    }
  }

  get model() {
    return this.sesion.model;
  }

  constructor(
    public sesion: AnalysisSessionDoc,
    public gptService: GPTService,
  ) {
    super();
  }

  async start() {
    console.log('> Start Deep Analysis');
    this.running = true;

    if (this.model.isCategorizedField) {
      await this.analyzeCategorizedField();
    } else if (this.sesion.useAPI) {
      await this.apiStart();
    } else {
      await this.manualStart();
    }
  }

  async analyzeCategorizedField() {
    const allCategories: string[] = [];
    this.model.excelFile?.rows.forEach((row: any) => {
      const fieldValue = this.getTargetField(row);
      if (this.isNoneValue(fieldValue)) {
        this.setRowCategories(row, 'None');
        return;
      }

      const categories = buildNoneValues(fieldValue);
      this.setRowCategories(row, categories.join('\n'));
      categories.forEach((category) => {
        if (!allCategories.includes(category)) {
          allCategories.push(category);
        }
      });
    });
    console.log('> All categories:', allCategories);
    this.model.categories = allCategories;
    this.emitProgress();
    this.emitAnalyzedRow(this.model.excelFile?.rows[0]);
  }

  async apiStart() {
    await this.runAnalysis();
  }

  async manualStart() {
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

  getContract() {
    const contract =
      this.model.contract || buildContract(this.model.categories);
    return this.sesion.useAPI ? contract : `>>> Contract: ${contract}`;
  }

  async runAnalysis() {
    if (!this.model.excelFile || !this.model.targetField) {
      return;
    }

    const contract = this.getContract();
    await this.gptService.contract(contract);

    let collectMode = this.sesion.mode === 'collect';

    if (await this.isContextOverflow()) {
      collectMode = true;
    }

    const patch = this.model.excelFile.rows.slice(0);
    for (const row of patch) {
      const existingCategories = await this.detectAnalyzedCategories(row);
      if (existingCategories) {
        this.setRowCategories(row, existingCategories);
        // console.log('> Already analyzed:', row);
        // this.emitAnalyzedRow(row);
        // this.emitProgress();
        continue;
      }
      if (!collectMode) {
        try {
          await this.analyze(row);
          this.emitAnalyzedRow(row);
          this.emitProgress();
        } catch (error) {
          if ((await this.isContextOverflow()) && this.sesion.sleepMode) {
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

    this.emitAnalyzedRow(patch[patch.length - 1]);
    this.emitProgress();
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

      // Wait for reply
      if (matchedCategories.length === 0 && !this.sesion.useAPI) {
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
        if (this.sesion.useAPI && this.sesion.sleepMode) {
          await delay('1s'); // Wrong response
          continue;
        }
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
    if (this.sesion.useAPI) {
      return false;
    }
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
    if (this.isNoneValue(feedback.trim())) {
      return 'None';
    }

    const duplicatedRow = this.model.excelFile?.rows.find(
      (rowI) => this.getTargetField(rowI).trim() === feedback.trim(),
    );
    const duplicatedRowCategories = this.getRowCategories(duplicatedRow);
    if (duplicatedRowCategories) {
      return duplicatedRowCategories;
    }

    if (this.sesion.useAPI) {
      return null;
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
    return row?.categories;
  }

  setRowCategories(row: any, categories: string) {
    row.categories = categories;
  }

  getTargetField(row: any): string {
    const { targetField } = this.model;
    const { [targetField!]: feedback } = row;
    return feedback || '';
  }

  getAllCategories(): string[] {
    const { categories } = this.model;
    return categories.concat(['None', 'Other']);
  }

  isNoneValue(value: string): boolean {
    const { noneValues, strongNoneValues } = this.model;
    return isNoneValue(value, { noneValues, strongNoneValues });
  }
}
