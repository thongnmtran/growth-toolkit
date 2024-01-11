import { Component } from 'solid-js';
import DocumentList from '../common/DocumentList';
import {
  CompetitorAnalysisDoc,
  ModelNames,
} from '@growth-toolkit/common-models';
import { findUniqueName } from '@growth-toolkit/common-utils';

interface CompetitorAnalysisListProps {
  onSelect?: (item?: CompetitorAnalysisDoc) => void;
}

const CompetitorAnalysisList: Component<CompetitorAnalysisListProps> = (
  props,
) => {
  return (
    <DocumentList
      modelName={ModelNames.CompetitorAnalysis}
      friendlyName="Competitor Analysis"
      labelProvider={(competitor) => competitor.name}
      onSelect={props.onSelect}
      itemCreator={(items) => {
        return {
          name: findUniqueName(`New Competitor Analysis`, items),
          dataUri:
            'https://docs.google.com/spreadsheets/d/1wuDn1-dHaU9gwbGDIfDgoJCAVX-AAU1IXK8ovlP3kpU/edit#gid=707279259',
          model: '',
          productColumn: '',
        };
      }}
    />
  );
};

export default CompetitorAnalysisList;
