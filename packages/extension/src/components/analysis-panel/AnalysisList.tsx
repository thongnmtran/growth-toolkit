import {
  AnalysisModelDoc,
  ModelNames,
  buildCategories,
  buildContract,
  isSameDoc,
} from '@growth-toolkit/common-models';
import { getStore } from '@growth-toolkit/common-modules';
import { uuid } from '@growth-toolkit/common-utils';
import {
  Button,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
} from '@suid/material';
import { Component, For, createEffect, onMount } from 'solid-js';
import {
  defaultCategories,
  defaultDataUri,
  defaultDetectingCategoriesHints,
  defaultNoneValues,
  defaultStrongNoneValues,
} from './analysis-panel-constants';
import CheckIcon from '../icons/CheckIcon';
import DeleteIcon from '../icons/DeleteIcon';
import { useCachedSignal } from '@/helpers/useCachedSignal';
import { createMutable, createStore, reconcile } from 'solid-js/store';

interface AnalysisListProps {
  onSelect?: (analysis?: AnalysisModelDoc) => void;
}

const AnalysisList: Component<AnalysisListProps> = (props) => {
  const [analysisModels, setAnalysisModels] = createStore<AnalysisModelDoc[]>(
    [],
  );
  const [selectedModelId, setSelectedModelId] = useCachedSignal<string>('', '');

  const store = getStore(ModelNames.AnalysisModel);

  onMount(() => {
    loadAnalysises();
  });

  const handleSelect = (model?: AnalysisModelDoc) => {
    props.onSelect?.(model);
    setSelectedModelId(model?._id ?? '');
  };

  createEffect(() => {
    [...analysisModels];
    const selected = analysisModels.find((m) => m._id === selectedModelId());
    handleSelect(selected || analysisModels[0]);
  });

  const loadAnalysises = async () => {
    const cachedModels = await store.findMany({ query: {} });
    setAnalysisModels(
      reconcile(cachedModels.map((model) => createMutable(model))),
    );
  };

  const handleNewAnalysis = async () => {
    const newModel: AnalysisModelDoc = createMutable({
      _id: uuid(),
      name: `New Analysis (${analysisModels.length + 1})`,
      dataUri: defaultDataUri,
      detectingCategoriesHints: defaultDetectingCategoriesHints,
      categories: buildCategories(defaultCategories),
      contract: buildContract(defaultCategories),
      noneExcluded: false,
      noneValues: defaultNoneValues.split(/,\s*/),
      strongNoneValues: defaultStrongNoneValues.split(/,\s*/),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    setAnalysisModels(reconcile([...analysisModels, newModel]));
    props.onSelect?.(newModel);
    await store.create(newModel);
  };

  const handleDeleteAnalysis = async (model: AnalysisModelDoc) => {
    if (!window.confirm('Are you sure you want to delete this analysis?')) {
      return;
    }
    await store.delete({ ref: model._id });
    if (isSameDoc(selectedModelId(), model)) {
      setSelectedModelId(model?._id ?? '');
    }
    await loadAnalysises();
  };

  return (
    <Stack width={300} spacing={2}>
      <Button variant="contained" onClick={handleNewAnalysis} fullWidth>
        + New Analysis
      </Button>
      <List dense>
        <For each={analysisModels}>
          {(model) => (
            <ListItem
              disablePadding
              // disableGutters
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteAnalysis(model)}
                  sx={{ '&:hover': { color: '#e87272' } }}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemButton
                onClick={() => handleSelect(model)}
                selected={isSameDoc(selectedModelId(), model)}
              >
                <ListItemIcon sx={{ minWidth: '30px' }}>
                  <CheckIcon />
                </ListItemIcon>
                <ListItemText primary={model.name} />
              </ListItemButton>
            </ListItem>
          )}
        </For>
      </List>
    </Stack>
  );
};

export default AnalysisList;
