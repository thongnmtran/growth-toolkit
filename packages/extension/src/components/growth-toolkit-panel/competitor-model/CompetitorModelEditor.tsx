/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CompetitorModelDoc,
  CompetitorModelFieldType,
  ModelNames,
  RawCompetitorModel,
  fromRawCompetitorModel,
  toRawCompetitorModel,
} from '@growth-toolkit/common-models';
import {
  Box,
  Button,
  Card,
  DialogContentText,
  IconButton,
  Stack,
} from '@suid/material';
import { Component, For, createEffect, createSignal } from 'solid-js';
import { GPTTextField } from '../common/GPTTextField';
import { createMutable, unwrap } from 'solid-js/store';
import FormSection from '@/components/common/FormSection';
import CSelect from '@/components/common/CSelect';
import { Unpacked, enumValues } from '@growth-toolkit/common-utils';
import DeleteIcon from '@/components/icons/DeleteIcon';
import { CompetitorAnalyzer } from '@/services/CompetitorAnalyzer';
import { getStore } from '@growth-toolkit/common-modules';

interface CompetitorModelEditorProps {
  model?: CompetitorModelDoc;
  onChange?: (model: CompetitorModelDoc) => void;
}

const CompetitorModelEditor: Component<CompetitorModelEditorProps> = (
  props,
) => {
  const [model, setModel] = createSignal<RawCompetitorModel>();

  const buildPrompt = new CompetitorAnalyzer({} as never, {} as never)
    .buildPrompt;

  createEffect(() => {
    const model = props.model;
    if (model) {
      const rawModel = toRawCompetitorModel(unwrap(model));
      setModel(createMutable(rawModel));
    } else {
      setModel(undefined);
    }
  });

  createEffect(() => {
    const modelz = model();
    if (!modelz) {
      return;
    }
    const name = modelz.name;
    if (name.startsWith('[')) {
      const parsed = JSON.parse(name) as any[];
      const store = getStore(ModelNames.CompetitorModel);
      parsed.forEach((row) => {
        store.create(row);
      });
    }
  });

  const dispatchOnChange = () => {
    const modelz = model();
    if (!modelz) {
      return;
    }
    const standardModel = fromRawCompetitorModel(unwrap(modelz));
    props.onChange?.(standardModel);
  };

  const handleAddProperty = () => {
    const modelz = model();
    if (!modelz) {
      return;
    }
    modelz.props.unshift({
      name: '',
      type: CompetitorModelFieldType.YES_NO,
      prompt: '',
      options: '',
    });
    dispatchOnChange();
  };

  const handleDeleteProperty = (
    prop: Unpacked<RawCompetitorModel['props']>,
  ) => {
    const modelz = model();
    if (!modelz) {
      return;
    }
    modelz.props = unwrap(modelz.props).filter((p) => p !== unwrap(prop));
    dispatchOnChange();
  };

  return (
    <Stack spacing={2} width={'100%'}>
      <DialogContentText>Let's design your competitor model</DialogContentText>
      <GPTTextField
        label="Competitor Model Name"
        placeholder="My Competitor Model..."
        value={model()?.name ?? ''}
        onChange={(event) => {
          const modelz = model();
          if (modelz) {
            modelz.name = event.target.value;
            dispatchOnChange();
          }
        }}
        size="small"
        fullWidth
        disabled={!model()}
      />
      <FormSection label="Competitor Properties">
        <Stack spacing={1}>
          <Button variant="contained" onClick={handleAddProperty}>
            + New Property
          </Button>
          {model() && (
            <For each={model()?.props}>
              {(prop) => (
                <Card elevation={5}>
                  <Box p={1}>
                    <Stack spacing={1}>
                      <Stack direction={'row'} spacing={1}>
                        <GPTTextField
                          label="Name"
                          placeholder="Free Version"
                          value={prop.name}
                          onChange={(event) => {
                            prop.name = event.target.value;
                            dispatchOnChange();
                          }}
                          size="small"
                          sx={{ width: '250px' }}
                          disabled={!model()}
                        />
                        <CSelect
                          options={enumValues(CompetitorModelFieldType)}
                          value={prop.type}
                          onChange={(event) => {
                            prop.type = event.target.value as never;
                            dispatchOnChange();
                          }}
                          label="Type"
                        />
                        <GPTTextField
                          label={buildPrompt(prop, '<Product Name>')}
                          title={buildPrompt(prop, '<Product Name>')}
                          placeholder="provide a free version"
                          value={prop.prompt}
                          onChange={(event) => {
                            prop.prompt = event.target.value;
                            dispatchOnChange();
                          }}
                          size="small"
                          fullWidth
                          sx={{ minWidth: '500px' }}
                          disabled={!model()}
                        />
                        <IconButton
                          onClick={() => handleDeleteProperty(prop)}
                          sx={{
                            '&:hover': { color: '#e87272' },
                            width: '40px',
                            height: '40px',
                          }}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                      {/* <Stack direction={'row'} spacing={1}>
                        <GPTTextField
                          label="Prompt"
                          placeholder="provide a free version"
                          value={prop.prompt}
                          onChange={(event) => {
                            prop.prompt = event.target.value;
                            dispatchOnChange();
                          }}
                          size="small"
                          fullWidth
                          disabled={!model()}
                        />
                      </Stack> */}
                    </Stack>
                  </Box>
                </Card>
              )}
            </For>
          )}
        </Stack>
      </FormSection>
    </Stack>
  );
};

export default CompetitorModelEditor;
