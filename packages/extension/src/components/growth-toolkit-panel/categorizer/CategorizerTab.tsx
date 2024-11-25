import { Component, createSignal } from 'solid-js';
import {
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  FormControlLabel,
  Stack,
} from '@suid/material';
import AnalysisList from './AnalysisList';
import AnalysisInfo from './AnalysisInfo';
import RocketIcon from '../../icons/RocketIcon';
import PieChartIcon from '../../icons/PieChartIcon';
import { useCachedSignal } from '../../../utils/useCachedSignal';
import { getStore } from '@growth-toolkit/common-modules';
import { unwrap } from 'solid-js/store';
import { uuid } from '@growth-toolkit/common-utils';
import {
  AnalysisModelDoc,
  AnalysisSessionDoc,
  ModelNames,
  mergeSessions,
} from '@growth-toolkit/common-models';

export interface CategorizerProps {
  onStartCategorizing?: (model: AnalysisSessionDoc, preview?: boolean) => void;
  onCancel?: () => void;
}

const CategorizerTab: Component<CategorizerProps> = (props) => {
  const [sleepMode, setSleepMode] = useCachedSignal<boolean>('sleepMode', true);
  const [useAPI, setUseAPI] = useCachedSignal<boolean>('useAPI', true);
  const [selectedModel, setSelectedModel] = createSignal<AnalysisModelDoc>();

  const runAnalysis = async (mode: AnalysisSessionDoc['mode']) => {
    const model = unwrap(selectedModel());
    if (!model) {
      return;
    }
    const isPreview = mode === 'preview';
    getStore(ModelNames.AnalysisModel).update({ doc: model });

    if (model.excelFile) {
      model.excelFile.rows = JSON.parse(JSON.stringify(model.excelFile?.rows));
    }

    const store = getStore(ModelNames.AnalysisSession);
    const oldSession = await store.find({
      query: { 'model._id': model._id },
    });
    let newSession: AnalysisSessionDoc = {
      _id: uuid(),
      model,
      mode,
      sleepMode: sleepMode(),
      useAPI: useAPI(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    if (!oldSession) {
      await store.create(newSession);
    } else {
      const isFieldOverriden =
        oldSession.model.targetField !== newSession.model.targetField;
      if (
        isFieldOverriden &&
        !window.confirm(
          'Analyze with a new field will clear the previous analyzed data. Are you sure?',
        )
      ) {
        return;
      }
      newSession = mergeSessions(oldSession, newSession);
      await store.update({ doc: newSession });
    }
    props.onStartCategorizing?.(newSession, isPreview);
  };

  const handleAnalysisChange = async (model: AnalysisModelDoc) => {
    const selectedModelz = selectedModel();
    if (selectedModelz) {
      Object.assign(selectedModelz, model);
      const store = getStore(ModelNames.AnalysisModel);
      await store.update({ doc: model });
    }
  };

  return (
    <>
      <DialogContent>
        <Stack>
          <Stack direction={'row'} spacing={2}>
            <AnalysisList onSelect={setSelectedModel} />
            <AnalysisInfo
              model={unwrap(selectedModel())}
              onChange={handleAnalysisChange}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Stack direction={'row'}>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={sleepMode()}
                onChange={(_event, checked) => setSleepMode(checked)}
              />
            }
            label="Sleep mode"
            disabled={!selectedModel()}
          />
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={useAPI()}
                onChange={(_event, checked) => setUseAPI(checked)}
              />
            }
            label="Use API Key"
            disabled={!selectedModel()}
          />
        </Stack>
        <Button onClick={props.onCancel} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={() => runAnalysis('preview')}
          variant="contained"
          disabled={!selectedModel()}
          startIcon={<PieChartIcon />}
        >
          Preview
        </Button>
        <Button
          onClick={() => runAnalysis('analyze')}
          variant="contained"
          disabled={!selectedModel()}
          startIcon={<RocketIcon />}
        >
          Start Analyzing
        </Button>
      </DialogActions>
    </>
  );
};

export default CategorizerTab;
