import {
  CompetitorAnalysisDoc,
  CompetitorModelDoc,
  ModelNames,
} from '@growth-toolkit/common-models';
import { Alert, Stack } from '@suid/material';
import { Component, createEffect, createMemo, createSignal } from 'solid-js';
import { GPTTextField } from '../common/GPTTextField';
import { createMutable, unwrap } from 'solid-js/store';
import FormSection from '@/components/common/FormSection';
import CSelect from '@/components/common/CSelect';
import { getStore } from '@growth-toolkit/common-modules';
import FileInfoBox from '../common/FileInfoBox';
import { fetchGoogleFile } from '@/utils/fetchGoogleFile';
import { parseExcelFile } from '@/utils/parseExcelFile';
import { getError } from '@growth-toolkit/common-utils';
import { AnalyzingStatistics } from '@/services/DeepAnalyzer';

interface CompetitorAnalysisEditorProps {
  model?: CompetitorAnalysisDoc;
  onChange?: (model: CompetitorAnalysisDoc) => void;
}

const CompetitorAnalysisEditor: Component<CompetitorAnalysisEditorProps> = (
  props,
) => {
  const [model, setModel] = createSignal<CompetitorAnalysisDoc>();
  const [competitorModels, setCompetitorModels] = createSignal<
    CompetitorModelDoc[]
  >([]);
  const [message, setMessage] = createSignal('');
  const [statistics, setStatistics] = createSignal<AnalyzingStatistics>();

  const models = createMemo(() => {
    return competitorModels().map((model) => ({
      value: model._id,
      label: model.name,
    }));
  });

  createEffect(() => {
    model();
    const store = getStore(ModelNames.CompetitorModel);
    store.findMany({ query: {} }).then((models) => {
      setCompetitorModels(models);
    });
  });

  createEffect(() => {
    const model = props.model;
    if (model) {
      setModel(createMutable(unwrap(model)));
    } else {
      setModel(undefined);
    }
  });

  createEffect(() => {
    const modelz = model();
    if (!modelz || modelz?.excelFile) {
      return;
    }
    modelz.excelFile = undefined;
    handleRefresh();
  });

  const dispatchOnChange = () => {
    const modelz = model();
    if (!modelz) {
      return;
    }
    props.onChange?.({ ...unwrap(modelz) });
  };

  const handleRefresh = async () => {
    setMessage('');

    const modelz = model();
    const dataUri = modelz?.dataUri;
    if (!dataUri) {
      if (modelz) {
        modelz.excelFile = undefined;
      }
      return;
    }

    return fetchGoogleFile(dataUri)
      .then(async (fileData) => {
        console.log('> File fetched:');
        try {
          const excelFile = await parseExcelFile(fileData);
          console.log(excelFile);
          modelz.excelFile = excelFile;

          const prevField = modelz.productColumn;
          modelz.productColumn =
            prevField && excelFile.headers.includes(prevField)
              ? prevField
              : excelFile.headers[0] || '';
          // detectCategoriedField(excelFile.rows);
          dispatchOnChange();
        } catch (error) {
          console.warn(error);
          setMessage(getError(error).message);
        }
      })
      .catch((error) => {
        console.warn(error);
        setMessage(getError(error)?.message || '');
      });
  };

  const handleReset = async () => {
    if (
      !window.confirm(
        'Are you sure you want to clear the current analyzed result?',
      )
    ) {
      return;
    }
    setStatistics(undefined);
    const store = getStore(ModelNames.CompetitorAnalysisSession);
    const oldSession = await store.find({
      query: { 'model._id': model()?._id },
    });
    if (oldSession) {
      await store.delete({ ref: oldSession._id });
    }
  };

  return (
    <Stack spacing={2} width={'100%'}>
      <GPTTextField
        label="Name"
        placeholder="My Competitor Analysis..."
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
      <FormSection label="Configurations">
        <Stack spacing={1}>
          <Stack spacing={1} width={600}>
            <GPTTextField
              component={'textarea'}
              label="Spreadsheet URL"
              placeholder="Input your spreadsheet url"
              value={model()?.dataUri ?? ''}
              onChange={(event) => {
                const modelz = model();
                if (modelz) {
                  modelz.dataUri = event.target.value;
                  dispatchOnChange();
                  handleRefresh();
                }
              }}
              size="small"
              multiline
              rows={2}
              fullWidth
              disabled={!model()}
            />
            {message() && <Alert severity="error">{message()}</Alert>}
          </Stack>
          <FileInfoBox
            info={model()?.excelFile?.info}
            onRefresh={handleRefresh}
            onReset={handleReset}
            details={
              statistics() &&
              `${statistics()?.analyzedExceptNone || 0}/${
                statistics()?.analyzed || 0
              }/${statistics()?.total || 0} (${(
                ((statistics()?.analyzed || 0) / (statistics()?.total || 0)) *
                100
              ).toFixed(2)}%)`
            }
          />
          {model() && (
            <CSelect
              label="Competitor Column"
              options={model()?.excelFile?.headers || []}
              value={model()?.productColumn}
              onChange={(event) => {
                const modelz = model();
                if (modelz) {
                  modelz.productColumn = event.target.value as never;
                  dispatchOnChange();
                }
              }}
            />
          )}
          {model() && (
            <CSelect
              label="Competitor Model"
              options={models()}
              value={model()?.model}
              onChange={(event) => {
                const modelz = model();
                if (modelz) {
                  modelz.model = event.target.value as never;
                  dispatchOnChange();
                }
              }}
            />
          )}
        </Stack>
      </FormSection>
    </Stack>
  );
};

export default CompetitorAnalysisEditor;
