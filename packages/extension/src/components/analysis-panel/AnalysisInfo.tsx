/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable solid/prefer-for */
import {
  Alert,
  Button,
  Checkbox,
  DialogContentText,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  styled,
} from '@suid/material';
import { Component, createEffect, createSignal } from 'solid-js';
import { createMutable, unwrap } from 'solid-js/store';
import FileInfoBox from './FileInfoBox';
import {
  AnalysisModelDoc,
  ModelNames,
  RawAnalysisModelDoc,
  buildCategories,
  buildContract,
  buildNoneValues,
  toAnalysisModel,
  toRawAnalysisModel,
} from '@growth-toolkit/common-models';
import { fetchGoogleFile } from '@/utils/fetchGoogleFile';
import { parseExcelFile } from '@/utils/parseExcelFile';
import { getError } from '@growth-toolkit/common-utils';
import {
  defaultDetectingCategoriesHints,
  defaultNoneValues,
  defaultStrongNoneValues,
} from './analysis-panel-constants';
import DetectIcon from '../icons/DetectIcon';
import { Spinner, SpinnerType } from 'solid-spinner';
import { GPTService } from '@/services/GPTService';
import { getStore } from '@growth-toolkit/common-modules';
import { analyzeCategories } from '@/helpers/analyzeCategories';
import { isNoneValue } from '@/utils/isNoneValue';
import { AnalyzingStatistics, DeepAnalyzer } from '@/services/DeepAnalyzer';

const StyledInput = styled(TextField)({
  width: '100%',
  '& *': {
    boxShadow: 'none !important',
  },
});

interface AnalysisInfoProps {
  model?: AnalysisModelDoc;
  onChange?: (model: AnalysisModelDoc) => void;
}

const AnalysisInfo: Component<AnalysisInfoProps> = (props) => {
  const [model, setModel] = createSignal<RawAnalysisModelDoc>();
  const [message, setMessage] = createSignal('');
  const [detecting, setDetecting] = createSignal(false);
  const [progress, setProgress] = createSignal(0);
  const [statistics, setStatistics] = createSignal<AnalyzingStatistics>();

  createEffect(() => {
    const model = props.model;
    if (model) {
      const rawModel = toRawAnalysisModel(model);
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
    const store = getStore(ModelNames.AnalysisSession);
    store
      .find({
        query: { 'model._id': model()?._id },
      })
      .then((oldSession) => {
        if (!oldSession) {
          return;
        }

        const sessionStatistics = new DeepAnalyzer(oldSession, {} as never)
          .statistics;
        setStatistics(sessionStatistics);
      });
  });

  const detectCategoriedField = (rows?: any[]) => {
    const modelz = model();
    if (!modelz || !rows || rows.length <= 0) {
      return;
    }
    const values = rows.map((row) => row[modelz.targetField as never]);

    const categories = analyzeCategories(values, {
      noneValues: modelz.noneValues,
      strongNoneValues: modelz.strongNoneValues,
    });
    const noneVolume = values.reduce((acc, value) => {
      if (
        isNoneValue(value, {
          noneValues: modelz.noneValues,
          strongNoneValues: modelz.strongNoneValues,
        })
      ) {
        return acc + 1;
      }
      return acc;
    }, 0);
    const numValidRows = values.length - noneVolume;
    const isCategorizedField = categories.length / numValidRows < 0.75;
    modelz.isCategorizedField = isCategorizedField;
  };

  const dispatchOnChange = () => {
    const modelz = model();
    if (!modelz) {
      return;
    }
    const standardModel = toAnalysisModel(unwrap(modelz));
    props.onChange?.(standardModel);
  };

  const handleDetectCategories = async () => {
    const modelz = model();
    if (!modelz || !modelz.excelFile) {
      return;
    }
    setDetecting(true);
    setProgress(0);
    try {
      const gptService = new GPTService();
      // const gptService = new GPTAPIService(
      //   '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',
      // );
      const rows: string[] = modelz.excelFile.rows.map(
        (row) => row[modelz.targetField as never],
      );
      const hints =
        modelz.detectingCategoriesHints || defaultDetectingCategoriesHints;
      const categories = await gptService.detectCategories(
        rows,
        hints,
        (progress) => {
          setProgress(progress);
        },
      );
      if (categories.length > 0) {
        handleRawCategoriesChange(categories.join('\n'));
      }
    } finally {
      setDetecting(false);
    }
  };

  const handleRawCategoriesChange = (newRawCategories: string) => {
    const modelz = model();
    if (!modelz) {
      return;
    }

    const isContractModified =
      buildContract(modelz.rawCategories) !== modelz.contract;

    modelz.rawCategories = newRawCategories;
    modelz.categories = buildCategories(newRawCategories);

    if (!isContractModified) {
      modelz.contract = buildContract(newRawCategories);
    }
    dispatchOnChange();
  };

  const handleContractChange = (newContract: string) => {
    const modelz = model();
    if (modelz) {
      modelz.contract = newContract || buildContract(modelz.rawCategories);
      dispatchOnChange();
    }
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

          const prevField = modelz.targetField;
          modelz.targetField =
            prevField && excelFile.headers.includes(prevField)
              ? prevField
              : excelFile.headers[0] || '';
          detectCategoriedField(excelFile.rows);
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
    setStatistics(undefined);
    const store = getStore(ModelNames.AnalysisSession);
    const oldSession = await store.find({
      query: { 'model._id': model()?._id },
    });
    if (oldSession) {
      await store.delete({ ref: oldSession._id });
    }
  };

  createEffect(() => {
    const modelz = model();
    const excelFile = modelz?.excelFile;
    if (!modelz || excelFile) {
      return;
    }
    console.log('> Start fetching file');

    modelz.excelFile = undefined;
    handleRefresh();
  });

  return (
    <Stack spacing={2}>
      <DialogContentText>Help analyze your data row by row</DialogContentText>
      <StyledInput
        label="Analysis name"
        placeholder="My Survey"
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
      <Stack spacing={1} width={600}>
        <StyledInput
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
      {model()?.targetField && (
        <Stack direction={'row'} spacing={2}>
          <FormControl fullWidth>
            <InputLabel id="targetField">Target field</InputLabel>
            <Select
              size="small"
              labelId="targetField"
              label="Target field"
              placeholder="Select the target field"
              value={model()?.targetField}
              id="targetField"
              onChange={(event) => {
                const modelz = model();
                if (modelz) {
                  modelz.targetField = event.target.value;
                  detectCategoriedField(modelz.excelFile?.rows);
                  dispatchOnChange();
                }
              }}
              disabled={!model()}
            >
              {(model()?.excelFile?.headers || []).map((column) => (
                <MenuItem value={column}>{column}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            label="Categorized field"
            control={
              <Checkbox
                size="small"
                checked={model()?.isCategorizedField ?? false}
                onChange={(_event, checked) => {
                  const modelz = model();
                  if (modelz) {
                    modelz.isCategorizedField = checked;
                    dispatchOnChange();
                  }
                }}
              />
            }
            disabled={!model()}
          />
        </Stack>
      )}
      <Stack direction={'row'} spacing={2}>
        <StyledInput
          label="Detecting categories' hints"
          placeholder="Input your detecting categories' hints"
          value={model()?.detectingCategoriesHints ?? ''}
          onChange={(event) => {
            const modelz = model();
            if (modelz) {
              modelz.detectingCategoriesHints = event.target.value;
              dispatchOnChange();
            }
          }}
          size="small"
          fullWidth
          disabled={!model() || model()?.isCategorizedField}
        />
        <Button
          startIcon={
            !detecting() ? (
              <DetectIcon />
            ) : (
              <Spinner type={SpinnerType.oval} width={24} height={24} />
            )
          }
          sx={{ whiteSpace: 'pre-line' }}
          variant="contained"
          onClick={handleDetectCategories}
          color="secondary"
          size="small"
          disabled={!model() || model()?.isCategorizedField}
        >
          {detecting()
            ? `Detecting... ${progress().toFixed(0)}%`
            : 'Detect categories'}
        </Button>
      </Stack>
      <StyledInput
        component={'textarea'}
        label="Target categories"
        placeholder="Input the target categories. Each category in one line."
        value={model()?.rawCategories ?? ''}
        onChange={(event) => handleRawCategoriesChange(event.target.value)}
        size="small"
        multiline
        rows={7}
        fullWidth
        disabled={!model() || detecting() || model()?.isCategorizedField}
      />
      <StyledInput
        component={'textarea'}
        label="Contract (You can leave it as it is)"
        value={model()?.contract ?? ''}
        onChange={(event) => handleContractChange(event.target.value)}
        size="small"
        multiline
        rows={7}
        fullWidth
        disabled={!model() || model()?.isCategorizedField}
      />
      <StyledInput
        component={'textarea'}
        label="None values"
        placeholder="Input the 'None' values (comma separator)."
        value={model()?.rawNoneValues ?? ''}
        onChange={(event) => {
          const modelz = model();
          if (modelz) {
            modelz.rawNoneValues = event.target.value || defaultNoneValues;
            modelz.noneValues = buildNoneValues(modelz.rawNoneValues);
            dispatchOnChange();
          }
        }}
        size="small"
        multiline
        rows={1}
        fullWidth
        disabled={!model()}
      />
      <StyledInput
        component={'textarea'}
        label="Strong 'None' values"
        placeholder="Input the strong 'None' values (comma separator)."
        value={model()?.rawStrongNoneValues ?? ''}
        onChange={(event) => {
          const modelz = model();
          if (modelz) {
            modelz.rawStrongNoneValues =
              event.target.value || defaultStrongNoneValues;
            modelz.strongNoneValues = buildNoneValues(modelz.rawNoneValues);
            dispatchOnChange();
          }
        }}
        size="small"
        multiline
        rows={1}
        fullWidth
        disabled={!model()}
      />
      <FormControlLabel
        control={
          <Checkbox
            size="small"
            checked={model()?.noneExcluded ?? false}
            onChange={(_event, checked) => {
              const modelz = model();
              if (modelz) {
                modelz.noneExcluded = checked;
                dispatchOnChange();
              }
            }}
          />
        }
        label="Exclude 'None' values"
        disabled={!model()}
      />
    </Stack>
  );
};

export default AnalysisInfo;
