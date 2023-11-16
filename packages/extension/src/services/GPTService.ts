/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  escapeXPathString,
  findElement,
  findElementByXPath,
  findElements,
  waitForSelector,
} from '@/helpers/automator';
import { delay } from '@katalon-toolbox/common-utils';
import escapeStringRegexp from 'escape-string-regexp';

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

    // const replyPromise = this.getReplyPromise();

    const sendButton = await waitForSelector('[data-testid="send-button"]');
    await sendButton?.click();

    console.log('> Sent:', message);

    await delay('1s');

    // const reply = await replyPromise;
    // console.log('> Received:', reply);

    const reply = await this.getLastReply();
    console.log('> Received:', reply);

    return reply;
  }

  async getReplyPromise() {
    return new Promise<string>((resolve) => {
      if (!(window as any)._fetch) {
        (window as any)._fetch = window.fetch;
        window.fetch = async (...args) => {
          const res = await (window as any)._fetch(...args);
          if (args[0] !== 'https://chat.openai.com/backend-api/conversation') {
            return res;
          }

          const clone = res.clone() as Response;
          if (!clone.body) {
            window.fetch = (window as any)._fetch;
            resolve('');
            return res;
          }

          let lastReply = '';

          const writer = new WritableStream(
            {
              write: async (chunk: Uint8Array) => {
                const chunkText = new TextDecoder().decode(chunk);
                const parts = chunkText
                  .split('data: ')
                  .filter((partI) => partI)
                  .map((partI) => JSON.parse(partI));
                console.log(parts);
                parts.forEach((partI) => {
                  const replyParts = partI?.message?.content?.parts;
                  if (replyParts) {
                    lastReply = replyParts.join('\n');
                  }
                });
              },
            },
            new CountQueuingStrategy({
              highWaterMark: 1,
            }),
          );

          clone.body.pipeTo(writer).finally(() => {
            window.fetch = (window as any)._fetch;
            resolve(lastReply);
          });

          return res;
        };
      }
    });
  }

  async waitForReply() {
    const timeout = 60000;
    await waitForSelector('button[aria-label="Stop generating"]', {
      hidden: true,
      timeout,
    });
    await waitForSelector('.result-thinking', {
      hidden: true,
      timeout,
    });
    await delay('1s');
  }

  async getLastReply(): Promise<string> {
    await this.waitForReply();
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

  getCurrentConversationName() {
    const currentLabel = findElement('//li//button/ancestor::li');
    return currentLabel?.textContent?.trim() || '';
  }

  getAllConversations(baseName: string) {
    const pureName = baseName.replace(/\s*-\s*[Pp]art\s*\d+$/, '');
    const labels = findElements('a[href*="/c/"]')
      .map((label) => {
        return {
          label: label.textContent?.trim() || '',
          href: label.getAttribute('href') || '',
        };
      })
      .filter(({ label }) =>
        new RegExp(
          `^${escapeStringRegexp(pureName)}(\\s*-\\s*[Pp]art\\s*\\d+)?$`,
        ).test(label),
      )
      .sort((a, b) => {
        const aMatch = a.label.match(/\s*-\s*[Pp]art\s*(\d+)$/)?.[1] || 0;
        const bMatch = b.label.match(/\s*-\s*[Pp]art\s*(\d+)$/)?.[1] || 0;
        return +aMatch - +bMatch;
      });
    return labels;
  }

  async gotoConversation(name: string) {
    const label = findElement(`//a[. = "${name}"]`);
    if (label) {
      label.click();
      await delay('1s');
      await waitForSelector('[data-testid*="conversation-turn-"]:last-of-type');
    }
  }
}
