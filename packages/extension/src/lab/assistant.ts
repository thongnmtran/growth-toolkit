/* eslint-disable @typescript-eslint/no-unused-vars */
import { delay } from '@growth-toolkit/common-utils';
import OpenAI from 'openai';

const assistantInstructions = `You are a categorizer. Respond only with the category names, each category on one line. Respond with 'None' if the feedback is spam or meaningless; respond with 'Other' if no category matches. The given categories are: "Performance, slowness, or memory usage", "Stability, bug, or function not working as expected", "User Interface and User Experience", "Cost, licensing, or Enterprise Features", "Limited Documentation and Community Support", "Limited Functionality and Features", "Integration and Compatibility Issues"`;

const mySpace = {
  apiKey: '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',
  assistantId: 'asst_6cBD4893mAwt5MIsgPqq96FM',
  threadId: 'thread_M40JvRrq7kGJow88KvCiThmp',
};

const growthSpace = {
  apiKey: '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',
  assistantId: 'asst_pRHhY2cs0FNC27I0JZ5YbJC1',
  threadId: 'thread_d8iEY8QqIqFskL6qpFwTiQEC',
};

const { apiKey, assistantId, threadId } = mySpace;

// ---

const openai = new OpenAI({
  apiKey,
});

const assistants = await openai.beta.assistants.list();
console.log('> Assistants:', assistants);

let assistant = await openai.beta.assistants
  .retrieve(assistantId)
  .catch(() => null);
if (!assistant) {
  console.log('> Creating assistant...');
  assistant = await openai.beta.assistants.create({
    instructions: assistantInstructions,
    model: 'gpt-3.5-turbo',
  });
}
console.log('> Assistant:', assistant.id, assistant);

let thread = await openai.beta.threads.retrieve(threadId).catch(() => null);
if (!thread) {
  console.log('> Creating thread...');
  thread = await openai.beta.threads.create();
}
console.log('> Thread:', thread.id, thread);

async function ask(question: string, assistantId: string) {
  const thread = await openai.beta.threads.create();
  const threadId = thread.id;

  try {
    const message = await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: question,
    });
    console.log('> Message:', message);

    await runThread(threadId, assistantId);

    const messages = await openai.beta.threads.messages.list(threadId);
    console.log('> Messages:', messages);

    const lastReply = messages.data[0];
    return lastReply?.content;
  } finally {
    await openai.beta.threads.del(threadId);
  }
}

async function runThread(threadId: string, assistantId: string) {
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
  });
  console.log('> Run:', run);

  do {
    const runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    console.log('> Run Status:', runStatus.status);
    if (runStatus.status === 'completed' || runStatus.status === 'failed') {
      break;
    }
    await delay('1s');
    // eslint-disable-next-line no-constant-condition
  } while (true);
}

// Message 1

const lastReply = await ask(
  "Feedback: didn't support long string",
  assistant.id,
);
console.log('> Last Reply:', lastReply);

const lastReply2 = await ask(
  'need a personal license ... paying >$1000 annually is nuts for something I would use a few times',
  assistant.id,
);
console.log('> Last Reply:', lastReply2);

console.log('> Done');
