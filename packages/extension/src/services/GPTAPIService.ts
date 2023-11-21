/* eslint-disable @typescript-eslint/no-unused-vars */
import { createAbortCtlFrom, delay } from '@growth-toolkit/common-utils';
import { GPTService } from './GPTService';
import OpenAI from 'openai';
import { buildCategories } from '@growth-toolkit/common-models';
import { CategoryDetector } from './CategoryDetector';

export class GPTAPIService extends GPTService {
  currentConversation: string[] = [];
  #openai?: OpenAI;
  #contract?: string;
  onAssistantIdChange?: (assistantId: string) => void;
  currentAborter?: AbortController;

  get openai() {
    if (!this.#openai) {
      this.#openai = new OpenAI({
        apiKey: this.apiKey,
        dangerouslyAllowBrowser: true,
      });
    }
    return this.#openai;
  }

  constructor(
    public apiKey: string,
    public assistantId?: string,
  ) {
    super();
  }

  override async contract(contract: string) {
    this.#contract = contract;
    // let assistant = this.assistantId
    //   ? await this.openai.beta.assistants
    //       .retrieve(this.assistantId)
    //       .catch(() => null)
    //   : null;
    // if (!assistant) {
    //   console.log('> Creating assistant...');
    //   assistant = await this.openai.beta.assistants.create({
    //     instructions: assistantInstructions,
    //     model: 'gpt-3.5-turbo',
    //   });
    //   this.assistantId = assistant.id;
    //   this.onAssistantIdChange?.(assistant.id);
    // }
  }

  override async ask(question: string): Promise<string> {
    const answer = await this.askChat(question);
    return answer;
  }

  async askChat(question: string) {
    const timeout = 15000;
    let reply = '';
    let aborted = false;
    this.currentAborter = new AbortController();
    this.currentAborter.signal.addEventListener('abort', () => {
      aborted = true;
    });
    while (!reply && !aborted) {
      reply = await new Promise<string>((resolve, reject) => {
        const aborter = createAbortCtlFrom(this.currentAborter!);
        aborter.signal.onabort = () => {
          resolve('');
        };
        const timer = setTimeout(() => {
          console.log('> askChat() timed out');
          aborter.abort();
          resolve('');
        }, timeout);

        this.openai.chat.completions
          .create(
            {
              model: 'gpt-3.5-turbo',
              messages: [
                {
                  role: 'user',
                  content: `${this.#contract}\n${question}`,
                },
              ],
              max_tokens: 500,
            },
            {
              signal: aborter.signal,
            },
          )
          .then((completion) => {
            resolve(completion.choices[0]?.message.content || '');
          })
          .catch(reject)
          .finally(() => {
            clearTimeout(timer);
          });
      });
    }
    return reply;
  }

  async askAssistant(question: string) {
    const thread = await this.openai.beta.threads.create();
    const threadId = thread.id;

    try {
      await this.openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: question,
      });
      console.log('> Sent:', question);

      await this.#runThread(threadId, this.assistantId!);

      const messages = await this.openai.beta.threads.messages.list(threadId);
      console.log('> Messages:', messages);

      const lastMessage = messages.data[0];
      if (lastMessage?.role !== 'assistant') {
        return '';
      }

      const lastReplyContent = messages.data[0]?.content;
      const lastReplyText =
        lastReplyContent?.[0]?.type === 'text'
          ? lastReplyContent?.[0]?.text.value
          : '';
      console.log('> Received:', lastReplyText);
      return lastReplyText as never;
    } finally {
      await this.openai.beta.threads.del(threadId);
    }
  }

  async #runThread(threadId: string, assistantId: string) {
    const run = await this.openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });
    console.log('> Run:', run);

    do {
      const runStatus = await this.openai.beta.threads.runs.retrieve(
        threadId,
        run.id,
      );
      console.log('> Run Status:', runStatus.status);
      if (runStatus.status === 'completed' || runStatus.status === 'failed') {
        break;
      }
      await delay('1s');
      // eslint-disable-next-line no-constant-condition
    } while (true);
  }

  override async detectCategories(
    rows: string[],
    hints = 'analyze the main categories',
    onProgress?: (progress: number) => void,
  ): Promise<string[]> {
    const messages = new CategoryDetector(rows, hints).buildMessages();

    const res = await this.openai.chat.completions.create({
      model: 'gpt-4-32k',
      messages: messages.map((chunk) => ({
        role: 'user',
        content: chunk,
      })),
    });
    console.log(res.choices);

    return buildCategories(res.choices[0]?.message.content || '');
  }

  override async abort(): Promise<void> {
    this.currentAborter?.abort();
  }
}
