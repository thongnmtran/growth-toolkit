/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CompetitorAnalysisSessionDoc,
  CompetitorModelDoc,
  CompetitorModelFieldType,
  CompetitorModelProperty,
  ModelNames,
} from '@growth-toolkit/common-models';
import { CustomEventEmitter } from '@growth-toolkit/common-utils';
import { GPTService } from './GPTService';
import { getStore } from '@growth-toolkit/common-modules';
import { AnalyzerEvent, AnalyzingStatistics } from './DeepAnalyzer';

export class CompetitorAnalyzer extends CustomEventEmitter<AnalyzerEvent> {
  running = false;
  model!: CompetitorModelDoc;

  get props() {
    return (this.model?.props || []).filter(
      (prop) => prop.prompt && !prop.prompt.startsWith('!'),
    );
  }

  get analysis() {
    return this.session.model;
  }

  get rows() {
    return this.session.model.excelFile?.rows || [];
  }

  get excelFile() {
    return this.analysis.excelFile;
  }

  constructor(
    public session: CompetitorAnalysisSessionDoc,
    public gptService: GPTService,
  ) {
    super();
  }

  get csvData() {
    return this.rows;
  }

  get statistics(): AnalyzingStatistics {
    const { excelFile } = this.analysis;
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
    const analyzed = rows.filter((row: any) => this.isAnalyzed(row)).length;
    const progress = Math.round((analyzed / total) * 100);
    return {
      total,
      analyzed,
      analyzedExceptNone: analyzed,
      progress,
    };
  }

  emitProgress() {
    try {
      this.emitEvent({
        type: 'progress',
        data: [],
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
        session: this.session as never,
      });
    } catch (error) {
      console.warn('> Emit analyzed row error:', error);
    }
  }

  async start() {
    this.running = true;

    const modelStore = getStore(ModelNames.CompetitorModel);
    this.model = await modelStore.find({ ref: this.session.model.model });

    if (this.session.useAPI) {
      await this.apiStart();
    } else {
      await this.manualStart();
    }
  }

  async apiStart() {
    await this.runAnalysis();
  }

  async runAnalysis() {
    if (!this.analysis.excelFile || !this.analysis.productColumn) {
      return;
    }

    const patch = this.rows.slice(0);
    for (const row of patch) {
      try {
        await this.analyze(row);
        // console.log('> Analyzed:', row);
        this.emitAnalyzedRow(row);
        this.emitProgress();
      } catch (error) {
        if (this.session.sleepMode) {
          console.warn(error);
          if (!this.running) {
            break;
          }
          setTimeout(() => {
            this.runAnalysis();
          }, 3000);
        } else {
          throw error;
        }
      }
      if (!this.running) {
        break;
      }
    }
    this.emitAnalyzedRow(patch[patch.length - 1]);
    this.emitProgress();
  }

  async analyze(row: any) {
    // console.log('> Analyzing:', row);
    for (const prop of this.props) {
      if (!this.running) {
        break;
      }
      await this.analyzeProp(row, prop);
    }

    // if (!row['SimilarWeb Rank']) {
    //   const url = row['URL'] || row['Home Page'];
    //   if (url && url !== 'unknown') {
    //     try {
    //       const rank = await this.collectSimilarWebRank(url);
    //       row['SimilarWeb Rank'] = rank;
    //       console.log('> SimilarWeb rank:', rank);
    //     } catch (error) {
    //       row['SimilarWeb Rank'] = 'unknown';
    //       console.warn('> SimilarWeb rank error:', error);
    //     }
    //   }
    // }
  }

  async analyzeProp(row: any, prop: CompetitorModelProperty) {
    const curValue = row[prop.name];
    if (curValue /*  && curValue !== 'unknown' */) {
      return;
    }
    const prompt = this.buildPrompt(prop, row[this.analysis.productColumn]);
    const reply = await this.gptService.ask(prompt);

    const resolvedReply = this.resolveReply(reply, prop);
    row[prop.name] = resolvedReply;
    console.log(`> ${prompt}: ${resolvedReply} (${reply})`);
  }

  buildPrompt(
    prop: Pick<CompetitorModelProperty, 'type' | 'prompt'>,
    product: string,
  ) {
    switch (prop.type) {
      case CompetitorModelFieldType.YES_NO:
        return `Is this true: the "${product}" product "${prop.prompt}"? Reply with "yes" or "no" only, no more or less. Reply "unknown" if you don't know.`;
      case CompetitorModelFieldType.NAME:
        return `Find me the "${prop.prompt}" of "${product}" product? Reply with the name only, no more or less. Reply "unknown" if you don't know.`;
      case CompetitorModelFieldType.TEXT:
        return `Find me the "${prop.prompt}" of "${product}" product? Reply with the value only, no more or less. Reply "unknown" if you don't know.`;
      case CompetitorModelFieldType.NUMBER:
        return `Find me the "${prop.prompt}" of "${product}" product? Reply with the value only, no more or less. Reply "unknown" if you don't know.`;
      case CompetitorModelFieldType.RANGE:
        return `${prop.prompt} of "${product}" product?`;
      case CompetitorModelFieldType.CATEGORIES:
        return `${prop.prompt} of "${product}" product?`;
      case CompetitorModelFieldType.AUTO:
        return `${prop.prompt} of "${product}" product?`;
      default:
        throw new Error(`Unknown field type: ${prop.type}`);
    }
  }

  resolveReply(reply: string, prop: CompetitorModelProperty) {
    switch (prop.type) {
      case CompetitorModelFieldType.YES_NO:
        return reply.toLowerCase().includes('yes')
          ? 'yes'
          : reply.toLowerCase().includes('unknown')
            ? 'unknown'
            : reply.toLowerCase().includes('no')
              ? 'no'
              : 'unknown';
      case CompetitorModelFieldType.NAME:
        return reply.replace(/\.$/, '');
      case CompetitorModelFieldType.TEXT:
        return reply;
      case CompetitorModelFieldType.NUMBER:
        return reply;
      case CompetitorModelFieldType.RANGE:
        return reply;
      case CompetitorModelFieldType.CATEGORIES:
        return reply;
      case CompetitorModelFieldType.AUTO:
        return reply;
      default:
        throw new Error(`Unknown field type: ${prop.type}`);
    }
  }

  isAnalyzed(row: any) {
    return this.props.every((prop) => {
      const value = row[prop.name];
      return value;
    });
  }

  async collectSimilarWebRank(site: string) {
    const hostname = new URL(site).hostname.replace('www.', '');
    const url = `https://api.similarweb.com/v1/similar-rank/${hostname}/rank?api_key=77a544d0c28e4f67b22cb9802c13ab99`;
    const res = await fetch(url);
    const json = await res.json();
    const rank = json.similar_rank.rank;
    return rank;
  }

  async manualStart() {
    //
  }

  async stop() {
    //
  }
}
