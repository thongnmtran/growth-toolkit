import { CompetitorAnalysisDoc } from './CompetitorAnalysis';
import { CompetitorModelDoc } from './CompetitorModel';

export type CompetitorAnalysisSession = {
  model: CompetitorAnalysisDoc;
  mode: 'collect' | 'analyze' | 'preview';
  sleepMode: boolean;
  useAPI: boolean;
};

export type CompetitorAnalysisSessionDoc = Doc<CompetitorAnalysisSession>;

export function mergeCompetitorSessions(
  oldSession: CompetitorAnalysisSessionDoc,
  newSession: CompetitorAnalysisSessionDoc,
  model: CompetitorModelDoc,
): CompetitorAnalysisSessionDoc {
  const merged = {
    ...oldSession,
    ...newSession,
  };
  merged._id = oldSession._id;
  const oldRows = oldSession.model.excelFile?.rows || [];
  const newRows = newSession.model.excelFile?.rows || [];

  const newProps = model.props;

  const oldProductColumn = oldSession.model.productColumn;
  const newProductColumn = newSession.model.productColumn;
  if (oldProductColumn && oldProductColumn === newProductColumn) {
    const targetField = oldProductColumn;
    newRows.forEach((newRow) => {
      const oldRow = oldRows.find(
        (oldRow) => oldRow[targetField] === newRow[targetField],
      );
      if (oldRow) {
        newProps.forEach((prop) => {
          if (prop.name) {
            newRow[prop.name] = oldRow[prop.name];
          }
        });
      }
    });
  }

  return merged;
}
