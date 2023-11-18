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

    await delay('2s');

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
    await delay('5s');
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

  async newConversationPart(partName: string) {
    // Rename current part to the next part name
    const currentPartNumber = this.getPartNumber(partName);
    if (currentPartNumber === 0) {
      const fullName = `${partName} - Part 1`;
      await this.renameActiveConversation(fullName);
    }

    findElement('a[href="/"]')?.click();

    await waitForSelector('button[as="button"]');

    await this.ask('Hi');

    await delay('2s');

    const nextPartName = this.findNextPartName(partName);
    await this.renameActiveConversation(nextPartName);
  }

  async renameActiveConversation(newName: string) {
    const currentLabel = findElement('//li//button/ancestor::li//a');
    currentLabel?.dispatchEvent(
      new MouseEvent('dblclick', {
        bubbles: true,
        button: 1,
        cancelable: true,
        view: window,
      }),
    );

    await delay('100ms');

    const nameInput = (await waitForSelector('input')) as HTMLInputElement;
    nameInput.value = newName;
    nameInput.dispatchEvent(new Event('change', { bubbles: true }));
    nameInput.blur();
  }

  findNextPartName(partName: string) {
    const parts = this.getAllConversationParts(partName);
    const nextPartNumber = Math.max(...parts.map((part) => part.order), 1) + 1;
    const pureName = partName.replace(/[\s-]*[Pp]art\s*\d+$/, '');
    const nextPart = `${pureName} - Part ${nextPartNumber}`;
    return nextPart;
  }

  getCurrentConversationName() {
    const currentLabel = findElement('//li//button/ancestor::li');
    return currentLabel?.textContent?.trim() || '';
  }

  getPartNumber(partName: string) {
    return +(partName.match(/[Pp]art\s*(\d+)$/)?.[1] || 0);
  }

  getAllConversationParts(baseName: string) {
    const pureName = baseName.replace(/[\s-]*[Pp]art\s*\d+$/, '');
    const parts = findElements('a[href*="/c/"]')
      .map((part) => {
        const label = part.textContent?.trim() || '';
        return {
          label,
          href: part.getAttribute('href') || '',
          order: this.getPartNumber(label),
        };
      })
      .filter(({ label }) => {
        const pattern1 = new RegExp(
          `^${escapeStringRegexp(pureName)}([Pp]art\\s*\\d+)?$`,
        );
        const pattern2 = new RegExp(
          `^${escapeStringRegexp(
            pureName.replaceAll(/\W/g, ''),
          )}([Pp]art\\s*\\d+)?$`,
        );
        return (
          pattern1.test(label) ||
          pattern1.test(label.replaceAll(/\W|\s\s/g, '')) ||
          pattern2.test(label) ||
          pattern2.test(label.replaceAll(/\W|\s\s/g, ''))
        );
      })
      .sort((a, b) => {
        return a.order - b.order;
      });
    return parts;
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
