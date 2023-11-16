import {
  escapeXPathString,
  findElement,
  findElementByXPath,
  findElements,
  waitForSelector,
} from '@/helpers/automator';
import { delay } from '@katalon-toolbox/common-utils';

export class GPTService {
  async contract(contract: string) {
    const xpath = `//*[contains(., ${escapeXPathString(
      contract.slice(0, 30),
    )})]`;
    console.log('> Finding contract:', xpath);
    const alreadyContracted = await waitForSelector(xpath, {
      timeout: 1000,
    }).catch(() => false);
    if (alreadyContracted) {
      console.log('> Already contracted');
      return;
    }
    console.log('> Contracting:', contract);
    await this.ask(contract);
  }

  findQuestion(question: string): string | null {
    const xpath = `//*[@data-message-author-role="user" and . = ${escapeXPathString(
      question,
    )}]`;
    const questionBox = findElement(xpath);
    if (!questionBox) {
      return null;
    }
    const parent = findElementByXPath(
      './ancestor::*[contains(@data-testid, "conversation-turn")]',
      questionBox,
    );
    if (!parent) {
      return null;
    }
    const testId = +(
      (parent.getAttribute('data-testid') || '').split('-').slice(-1)[0] || ''
    );
    if (!testId) {
      return null;
    }
    const reply = findElementByXPath(
      `//*[@data-testid="conversation-turn-${
        testId + 1
      }"]//div[@data-message-author-role="assistant"]`,
    );
    if (!reply) {
      return null;
    }
    return reply.textContent?.trim() || null;
  }

  isLastQuestion(question: string): boolean {
    const xpath = `//*[@data-message-author-role="user" and . = ${escapeXPathString(
      question,
    )}]`;
    const questionBox = findElement(xpath);
    if (!questionBox) {
      return false;
    }
    const parent = findElementByXPath(
      './ancestor::*[contains(@data-testid, "conversation-turn")]',
      questionBox,
    );
    if (!parent) {
      return false;
    }
    const testId = +(
      (parent.getAttribute('data-testid') || '').split('-').slice(-1)[0] || ''
    );
    if (!testId) {
      return false;
    }
    const reply = findElementByXPath(
      `//*[@data-testid="conversation-turn-${
        testId + 2
      }"]//div[@data-message-author-role="assistant"]`,
    );
    return !reply;
  }

  async ask(message: string): Promise<string> {
    const input = (await waitForSelector(
      '#prompt-textarea',
    )) as HTMLTextAreaElement;
    input.value = message;
    input.dispatchEvent(new Event('input', { bubbles: true }));

    const sendButton = await waitForSelector('[data-testid="send-button"]');
    await sendButton?.click();

    console.log('> Sent:', message);

    await delay('1s');
    await this.waitForReply();

    const reply = await this.getLastReply();
    console.log('> Received:', reply);

    return reply;
  }

  async waitForReply() {
    await waitForSelector('button[aria-label="Stop generating"]', {
      hidden: true,
    });
    await waitForSelector('.result-thinking', {
      hidden: true,
    });
    await delay('0.5s');
  }

  async getLastReply(): Promise<string> {
    const replies = await findElements(
      '[data-message-author-role="assistant"]',
    );
    const lastReplyElement = replies.splice(-1)[0];
    const lastReply = lastReplyElement?.innerText?.trim();
    return lastReply || '';
  }

  async abort() {
    const stopButton = await waitForSelector(
      'button[aria-label="Stop generating"]',
      {
        timeout: 1000,
      },
    ).catch(() => null);
    if (stopButton) {
      stopButton.click();
      await delay('0.5s');
    }
  }
}
