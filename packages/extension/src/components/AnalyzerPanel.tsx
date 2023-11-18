/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  styled,
} from '@suid/material';
import { DialogProps } from '@suid/material/Dialog';
import { TextFieldProps } from '@suid/material/TextField';
import { For, Signal, createEffect, createSignal } from 'solid-js';
import { FileInfo } from '@/models/FileInfo';
import { fetchGoogleFile } from '@/helpers/fetchGoogleFile';
import FileInfoBox from './FileInfoBox';
import { parseExcelFile } from '@/helpers/parseExcelFile';
import { getError } from '@katalon-toolbox/common-utils';
import { ExcelFile } from '@/models/ExcelFile';
import { AnalysisModel } from '@/models/AnalysisModel';
import { SelectProps } from '@suid/material/Select';
import GlobalStore from '@/helpers/GlobalStore';

const StyledInput = styled(TextField)({
  width: '100%',
  '& *': {
    boxShadow: 'none !important',
  },
});

export interface AnalyzerPanelProps extends DialogProps {
  onOK?: (model: AnalysisModel) => void;
  onCancel?: () => void;
}

const defaultCategories = [
  'Performance, slowness, or memory usage',
  'Stability, bug, or function not working as expected',
  'User Interface and User Experience',
  'Cost, licensing, or Enterprise Features',
  'Limited Documentation and Community Support',
  'Limited Functionality and Features',
  'Integration and Compatibility Issues',
].join('\n');

const defaultNoneValues = [
  'N/A',
  'NA',
  'NIL',
  'NULL',
  'None',
  'Nothing',
  'No',
  '[NULL]',
  'Test',
].join(', ');

const defaultStrongNoneValues = [
  'sdf',
  'sfd',
  'dfs',
  'dsf',
  'asd',
  'dsa',
  'das',
  'sda',
  'zxc',
  'xcv',
  'qwe',
  'wer',
  'ert',
].join(', ');

function useCachedSignal<Type>(key: string, initialValue: Type): Signal<Type> {
  GlobalStore.prefix = 'growth-toolkit-';
  const defaultValue =
    typeof initialValue === 'string'
      ? GlobalStore.get(key, initialValue) || initialValue
      : GlobalStore.get(key, initialValue);
  const [value, setValue] = createSignal(defaultValue);
  createEffect(() => {
    GlobalStore.set(key, value());
  });
  return [value, setValue];
}

const AnalyzerPanel = (props: AnalyzerPanelProps) => {
  const [message, setMessage] = createSignal('');
  const [dataUri, setDataUri] = useCachedSignal(
    'dataUri',
    'https://docs.google.com/spreadsheets/d/1jUtCH2EKO63O2WgBWgBd_CfKaIo-Y_hwjsyF8jyNTtA/edit?usp=drive_link',
  );
  const [fileInfo, setFileInfo] = createSignal<FileInfo>();
  const [excelFile, setExcelFile] = createSignal<ExcelFile>();
  const [selectedField, setSelectedField] = useCachedSignal<string | null>(
    'selectedField',
    null,
  );
  const [rawCategories, setRawCategories] = useCachedSignal<string>(
    'rawCategories',
    defaultCategories,
  );
  const [rawNoneValues, setRawNoneValues] = useCachedSignal<string>(
    'rawNoneValues',
    defaultNoneValues,
  );
  const [rawStrongNoneValues, setRawStrongNoneValues] = useCachedSignal<string>(
    'rawStrongNoneValues',
    defaultStrongNoneValues,
  );
  const [analysisModel, setAnalysisModel] = createSignal<AnalysisModel>();
  const [sleepMode, setSleepMode] = useCachedSignal<boolean>('sleepMode', true);
  const [noneExcluded, setNoneExcluded] = useCachedSignal<boolean>(
    'noneExcluded',
    true,
  );

  createEffect(() => {
    setAnalysisModel({
      excelFile: excelFile(),
      targetField: selectedField(),
      categories: rawCategories()
        .split('\n')
        .map((category) => category.trim())
        .filter((category) => category),
      noneValues: rawNoneValues()
        .split(',')
        .map((value) => value.trim())
        .filter((value) => value),
      strongNoneValues: rawStrongNoneValues()
        .split(',')
        .map((value) => value.trim())
        .filter((value) => value),
      noneExcluded: noneExcluded(),
      sleepMode: sleepMode(),
    } as AnalysisModel);
  });

  createEffect(() => {
    const fileUri = dataUri();
    if (!fileUri) {
      return;
    }
    console.log('> Start fetching file');

    setMessage('');
    setExcelFile(undefined);
    setFileInfo(undefined);

    fetchGoogleFile(fileUri)
      .then(async (fileData) => {
        console.log('> File fetched');
        setFileInfo(fileData.info);
        try {
          const excelFile = await parseExcelFile(fileData);
          setExcelFile(excelFile);
          setSelectedField((prevField) => {
            return prevField && excelFile.headers.includes(prevField)
              ? prevField
              : excelFile.headers[0] || '';
          });
          console.log(excelFile);
        } catch (error) {
          console.warn(error);
          setMessage(getError(error).message);
        }
      })
      .catch((error) => {
        console.warn(error);
        setMessage(getError(error)?.message || '');
      });
  });

  const handleDataUriChange: TextFieldProps['onChange'] = (event) => {
    setDataUri(event.target.value);
  };

  const runAnalysis = (mode: AnalysisModel['mode']) => {
    props.onOK?.({ ...analysisModel()!, mode });
  };

  const handleTargetFieldChange: SelectProps['onChange'] = (event) => {
    setSelectedField(event.target.value as string);
  };

  return (
    <Dialog
      {...props}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="xl"
      onClose={props.onCancel}
    >
      <DialogTitle>{'Growth Toolkit'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <DialogContentText>
            Help analyze your data row by row
          </DialogContentText>
          <Stack spacing={1} width={600}>
            <StyledInput
              component={'textarea'}
              label="Spreadsheet URL"
              placeholder="Input your spreadsheet url"
              value={dataUri()}
              onChange={handleDataUriChange}
              size="small"
              multiline
              rows={2}
              fullWidth
            />
            {message() && <Alert severity="error">{message()}</Alert>}
          </Stack>
          {excelFile() && (
            <>
              <FileInfoBox info={fileInfo()} />
              <Select
                size="small"
                value={selectedField()}
                onChange={handleTargetFieldChange}
              >
                <For each={excelFile()?.headers || []}>
                  {(column) => <MenuItem value={column}>{column}</MenuItem>}
                </For>
              </Select>
            </>
          )}
          <StyledInput
            component={'textarea'}
            label="Target categories"
            placeholder="Input the target categories. Each category in one line."
            value={rawCategories()}
            onChange={(event) => setRawCategories(event.target.value)}
            size="small"
            multiline
            rows={7}
            fullWidth
          />
          <StyledInput
            component={'textarea'}
            label="None values"
            placeholder="Input the 'None' values (comma separator)."
            value={rawNoneValues()}
            onChange={(event) => setRawNoneValues(event.target.value)}
            size="small"
            multiline
            rows={1}
            fullWidth
          />
          <StyledInput
            component={'textarea'}
            label="Strong 'None' values"
            placeholder="Input the strong 'None' values (comma separator)."
            value={rawStrongNoneValues()}
            onChange={(event) => setRawStrongNoneValues(event.target.value)}
            size="small"
            multiline
            rows={1}
            fullWidth
          />
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={noneExcluded()}
                onChange={(_event, checked) => setNoneExcluded(checked)}
              />
            }
            label="Exclude 'None' values"
          />
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={sleepMode()}
                onChange={(_event, checked) => setSleepMode(checked)}
              />
            }
            label="Sleep mode"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onCancel} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={() => runAnalysis('analyze')}
          variant="contained"
          disabled={!analysisModel()}
        >
          Start Analyzing
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AnalyzerPanel;
