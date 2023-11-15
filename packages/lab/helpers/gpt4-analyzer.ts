import puppeteer, { ElementHandle, Page } from 'puppeteer';
import { Links } from '../../common/constants';
import { delay, delayForever } from '../../common/utils/time-utils';
import { openBrowser, openUndetectedBrowser } from './browser-utils';
import { readCSV, saveData } from './csv-utils';

class GPTConversation {
  constructor(public page: Page) {}

  async open(title: string) {
    await this.page.goto(Links.CHAT_GPT);
    if (title) {
      await this.continue(title);
    }
  }

  async continue(title: string) {
    const conversation = (await this.page.waitForXPath(
      `//li[contains(., "${title}")]`
    )) as ElementHandle<Element>;
    await conversation?.click();
    await delay(5);
  }

  async send(message: string) {
    const input: ElementHandle<HTMLTextAreaElement> | null =
      (await this.page.waitForSelector('#prompt-textarea')) as any;
    await input?.evaluate((el, message) => (el.value = message), message);

    await input?.type(' \n');
    const sendButton = await this.page.waitForSelector(
      '[data-testid="send-button"]'
    );
    await sendButton?.click();

    console.log('> Sent:', message);

    await delay(2);
    await this.waitForReply();

    const reply = await this.getLastReply();
    console.log('> Received:', reply);

    return reply;
  }

  async waitForReply() {
    await this.page.waitForSelector('button[aria-label="Stop generating"]', {
      hidden: true,
    });
  }

  async getLastReply(): Promise<string> {
    const replies = await this.page.$$(
      '[data-message-author-role="assistant"]'
    );
    const lastReplyElement = replies.splice(-1)[0];
    const lastReply = await lastReplyElement.evaluate((el) => el.textContent);
    return lastReply || '';
  }

  async contract(contract: string) {
    const alreadyContracted = await this.page
      .waitForXPath(`//*[contains(., "${contract.slice(0, 30)}")]`, {
        timeout: 1000,
      })
      .catch(() => false);
    if (alreadyContracted) {
      return;
    }
    await this.send(contract);
  }
}

type FeedbackRecord = {
  feedback: string;
  category: string;
};

async function categorize(options: {
  input: string;
  output: string;
  categories: string[];
  title: string;
}): Promise<any[]> {
  const { input, output, title, categories } = options;

  const reviews: FeedbackRecord[] = await readCSV(input);

  const browser = await openUndetectedBrowser();
  const page = await browser.newPage();

  const conversation = new GPTConversation(page);
  await conversation.open(title);

  const rawCategories = `"${categories.join('", "')}"`;
  const contract = `Given the categories below, please categorize all the following pieces of feedback. Reply only with the category names; respond with 'None' if the feedback is spam or meaningless, and 'Other' if no category matches. The given categories are: ${rawCategories}`;

  await conversation.contract(contract);

  const patch = reviews.slice(50, 100);

  for (const review of patch) {
    const reply = await conversation.send(review.feedback);
    review.category = reply;
    await saveData(patch, output);
    await delay(1);
  }

  return reviews;
}

const result = await categorize({
  input: 'data/exit-feedbacks.csv',
  output: 'data/exit-feedbacks-categorized.csv',
  title: 'Test - GPT-3',
  categories: [
    'Performance, slowness, or memory usage',
    'Stabability, bug, or function not working as expected',
    'User Interface and User Experience',
    'Cost, licensing or Enterprise Features',
    'Limited Documentation and Community Support',
    'Limited Functionality and Features',
    'Integration and Compatibility Issues',
  ],
});

console.log(`> Done! ${result.length}`);
