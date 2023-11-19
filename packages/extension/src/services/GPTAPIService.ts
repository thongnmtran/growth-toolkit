import { GPTService } from './GPTService';
import OpenAI from 'openai';

export class GPTAPIService extends GPTService {
  currentConversation: string[] = [];

  #ai?: OpenAI;

  get ai() {
    if (!this.#ai) {
      this.#ai = new OpenAI({
        apiKey: this.apiKey,
      });
    }
    return this.#ai!;
  }

  constructor(public apiKey: string) {
    super();
  }

  override getCurrentConversationName(): string {
    // const api = new ChatGPTAPI({
    //   apiKey: this.apiKey,
    // });
    // api.sendMessage;
    this.ai.beta;
  }
}
