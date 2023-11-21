import { AnalysisModelDoc } from './AnalysisModel';

export type AnalysisSession = {
  model: AnalysisModelDoc;
  mode: 'collect' | 'analyze';
  sleepMode: boolean;
  useAPI: boolean;
  assistantId?: string;
};

export type AnalysisSessionDoc = Doc<AnalysisSession>;

export function mergeSessions(
  oldSession: AnalysisSessionDoc,
  newSession: AnalysisSessionDoc,
): AnalysisSessionDoc {
  const merged = {
    ...oldSession,
    ...newSession,
  };
  merged._id = oldSession._id;
  const oldRows = oldSession.model.excelFile?.rows || [];
  const newRows = newSession.model.excelFile?.rows || [];
  const oldTargetField = oldSession.model.targetField;
  const newTargetField = newSession.model.targetField;
  if (oldTargetField && oldTargetField === newTargetField) {
    const targetField = oldTargetField;
    newRows.forEach((row) => {
      const sameRow = oldRows.find(
        (oldRow) => oldRow[targetField] === row[targetField],
      );
      if (sameRow) {
        row.categories = sameRow.categories;
      }
    });
  }

  return merged;
}
