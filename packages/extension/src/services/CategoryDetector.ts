export class CategoryDetector {
  constructor(
    public rows: string[],
    public hint: string = 'categorize all the provided feedback',
  ) {}

  buildMessages() {
    const firstIntro = `The document, that I'm about to share, will be divided into several parts. I request that you wait until all parts have been provided before summarizing or answering any questions about it.`;

    const partIntro = `This is one of several parts of the document.
    Please wait until all parts have been provided before summarizing or answering any questions about it.`;

    const lastPartIntro = `This is the final segment of the document.
    Please carefully review all parts of the document that have been provided in this conversation before summarizing or answering any questions about it. Once you have reviewed all sections of the document, please respond with "I have finished reviewing the document and I'm ready to assist you with your inquiries."`;

    const categorizeRequest = `${this.hint} from the above feedback. Only respond with the category names, each category or category group on one line.`;

    const maxChunkSize = 10000 - partIntro.length;
    const chunks: string[] = [];
    let lastChunk: string[] = [];
    let lastChunkSize = 0;
    for (const row of this.rows) {
      if (lastChunkSize + row.length > maxChunkSize) {
        chunks.push(lastChunk.join('\n'));
        lastChunk = [];
        lastChunkSize = 0;
      }

      lastChunk.push(row);
      lastChunkSize += row.length;
    }
    if (lastChunk.length > 0) {
      chunks.push(lastChunk.join('\n'));
    }

    const buildPart = (
      part: string,
      intro: string,
      partNumber: number,
      numParts: number,
    ) => {
      return `${intro}\n\nFilename: data.csv\nPart ${partNumber} of ${numParts}:\n\n${part}`;
    };

    const messages = chunks.map((chunk, index) => {
      const intro = index === chunks.length - 1 ? lastPartIntro : partIntro;
      const part = buildPart(chunk, intro, index + 1, chunks.length);
      return part;
    });
    messages.unshift(firstIntro);
    messages.push(categorizeRequest);

    return messages;
  }
}
