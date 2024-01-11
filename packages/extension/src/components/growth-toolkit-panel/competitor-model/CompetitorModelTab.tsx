import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  Stack,
} from '@suid/material';
import { Component, createSignal } from 'solid-js';
import CompetitorModelList from './CompetitorModelList';
import CompetitorModelEditor from './CompetitorModelEditor';
import { CompetitorModelDoc, ModelNames } from '@growth-toolkit/common-models';
import { modifyMutable, reconcile, unwrap } from 'solid-js/store';
import { getStore } from '@growth-toolkit/common-modules';

interface CompetitorModelTabProps {
  onCancel?: () => void;
}

const CompetitorModelTab: Component<CompetitorModelTabProps> = (props) => {
  const [selectedModel, setSelectedModel] = createSignal<CompetitorModelDoc>();

  const handleAnalysisChange = async (model: CompetitorModelDoc) => {
    const selectedModelz = selectedModel();
    if (selectedModelz) {
      modifyMutable(selectedModelz, reconcile(model));
    }
    const store = getStore(ModelNames.CompetitorModel);
    await store.update({ doc: model });
  };

  return (
    <>
      <DialogContent>
        <Stack>
          <Stack direction={'row'} spacing={2}>
            <Box width={300}>
              <CompetitorModelList onSelect={setSelectedModel} />
            </Box>
            <CompetitorModelEditor
              model={unwrap(selectedModel())}
              onChange={handleAnalysisChange}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onCancel} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </>
  );
};

export default CompetitorModelTab;
