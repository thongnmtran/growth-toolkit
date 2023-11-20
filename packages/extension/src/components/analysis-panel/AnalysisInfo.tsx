/* eslint-disable solid/prefer-for */
import {
  Alert,
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
  RawAnalysisModelDoc,
  buildContract,
  toAnalysisModel,
  toRawAnalysisModel,
} from '@growth-toolkit/common-models';
import { fetchGoogleFile } from '@/helpers/fetchGoogleFile';
import { parseExcelFile } from '@/helpers/parseExcelFile';
import { getError } from '@growth-toolkit/common-utils';
import { TextFieldProps } from '@suid/material/TextField';
import {
  defaultNoneValues,
  defaultStrongNoneValues,
} from './analysis-panel-constants';

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

  createEffect(() => {
    const model = props.model;
    if (model) {
      const rawModel = toRawAnalysisModel(model);
      setModel(createMutable(rawModel));
    } else {
      setModel(undefined);
    }
  });

  const dispatchOnChange = () => {
    const modelz = model();
    if (!modelz) {
      return;
    }
    const standardModel = toAnalysisModel(unwrap(modelz));
    props.onChange?.(standardModel);
  };

  const handleRawCategoriesChange: TextFieldProps['onChange'] = (event) => {
    const modelz = model();
    if (!modelz) {
      return;
    }

    const newRawCategories = event.target.value;
    modelz.rawCategories = newRawCategories;

    const isContractModified =
      buildContract(modelz.rawCategories) !== modelz.contract;
    if (!isContractModified) {
      modelz.contract = buildContract(newRawCategories);
    }
    dispatchOnChange();
  };

  const handleRefresh = async () => {
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

  createEffect(() => {
    const modelz = model();
    const excelFile = modelz?.excelFile;
    if (!modelz || excelFile) {
      return;
    }
    console.log('> Start fetching file');

    setMessage('');
    modelz.excelFile = undefined;
    handleRefresh();
  });

  return (
    <Stack spacing={2}>
      <DialogContentText>Help analyze your data row by row</DialogContentText>
      <StyledInput
        component={'textarea'}
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
      <FileInfoBox info={model()?.excelFile?.info} onRefresh={handleRefresh} />
      {model()?.targetField && (
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
      )}
      <StyledInput
        component={'textarea'}
        label="Target categories"
        placeholder="Input the target categories. Each category in one line."
        value={model()?.rawCategories ?? ''}
        onChange={handleRawCategoriesChange}
        size="small"
        multiline
        rows={7}
        fullWidth
        disabled={!model()}
      />
      <StyledInput
        component={'textarea'}
        label="Contract (You can leave it as it is)"
        value={model()?.contract ?? ''}
        onChange={(event) => {
          const modelz = model();
          if (modelz) {
            modelz.contract = event.target.value;
            dispatchOnChange();
          }
        }}
        size="small"
        multiline
        rows={7}
        fullWidth
        disabled={!model()}
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
