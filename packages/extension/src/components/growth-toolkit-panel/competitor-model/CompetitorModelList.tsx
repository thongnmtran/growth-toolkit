import { Component } from 'solid-js';
import DocumentList from '../common/DocumentList';
import { CompetitorModelDoc, ModelNames } from '@growth-toolkit/common-models';
import { findUniqueName } from '@growth-toolkit/common-utils';
// import { copyExcelFile } from '@/utils/copyExcelFile';

interface CompetitorModelListProps {
  onSelect?: (item?: CompetitorModelDoc) => void;
}

const CompetitorModelList: Component<CompetitorModelListProps> = (props) => {
  return (
    <DocumentList
      modelName={ModelNames.CompetitorModel}
      friendlyName="Competitor Model"
      labelProvider={(competitor) => competitor.name}
      onSelect={props.onSelect}
      itemCreator={(items) => {
        return {
          name: findUniqueName(`New Competitor Model`, items),
          props: [],
        };
      }}
      onLoad={(items) => {
        console.log(items);
        // copyExcelFile(items);
      }}
    />
  );
};

export default CompetitorModelList;
