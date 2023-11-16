import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Select,
  Stack,
  TextField,
  styled,
} from '@suid/material';
import { DialogProps } from '@suid/material/Dialog';
import { TextFieldProps } from '@suid/material/TextField';
import { For, createEffect, createSignal } from 'solid-js';
import { FileInfo } from '@/models/FileInfo';
import { fetchGoogleFile } from '@/helpers/fetchGoogleFile';
import FileInfoBox from './FileInfoBox';
import { parseExcelFile } from '@/helpers/parseExcelFile';
import { getError } from '@katalon-toolbox/common-utils';
import { ExcelFile } from '@/models/ExcelFile';
import { AnalysisModel } from '@/models/AnalysisModel';

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

const AnalyzerPanel = (props: AnalyzerPanelProps) => {
  const [value, setValue] = createSignal(
    'https://docs.google.com/spreadsheets/d/1jUtCH2EKO63O2WgBWgBd_CfKaIo-Y_hwjsyF8jyNTtA/edit?usp=drive_link',
  );
  const [message, setMessage] = createSignal('');
  const [fileInfo, setFileInfo] = createSignal<FileInfo>();
  const [excelFile, setExcelFile] = createSignal<ExcelFile>();
  const [selectedField, setSelectedField] = createSignal<string>('');
  const [rawCategories, setRawCategories] =
    createSignal<string>(defaultCategories);
  const [analysisModel, setAnalysisModel] = createSignal<AnalysisModel>();

  createEffect(() => {
    setAnalysisModel({
      excelFile: excelFile(),
      targetField: selectedField(),
      categories: rawCategories()
        .split('\n')
        .map((category) => category.trim())
        .filter((category) => category),
    } as AnalysisModel);
  });

  createEffect(() => {
    const fileUri = value();
    if (!fileUri) {
      return;
    }
    console.log('> Start fetching file');
    setMessage('');
    fetchGoogleFile(fileUri)
      .then(async (fileData) => {
        console.log('> File fetched');
        setFileInfo(fileData.info);
        try {
          const excelFile = await parseExcelFile(fileData);
          setExcelFile(excelFile);
          setSelectedField(excelFile.headers[0] || '');
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

  const handleInputChange: TextFieldProps['onChange'] = (event) => {
    setValue(event.target.value);
  };

  const runAnalysis = (mode: AnalysisModel['mode']) => {
    props.onOK?.({ ...analysisModel()!, mode });
  };

  return (
    <Dialog
      {...props}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="xl"
      onClose={props.onCancel}
    >
      <DialogTitle>{'Deep Analyzer'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <DialogContentText>
            Help to analyze your data row by row.
          </DialogContentText>
          <Stack spacing={1} width={600}>
            <StyledInput
              component={'textarea'}
              placeholder="Input your spreadsheet url"
              value={value()}
              onChange={handleInputChange}
              size="small"
              multiline
              rows={2}
              fullWidth
            />
            {message() && <Alert severity="error">{message()}</Alert>}
          </Stack>
          <FileInfoBox info={fileInfo()} />
          {excelFile() && (
            <Select size="small" value={selectedField()}>
              <For each={excelFile()?.headers || []}>
                {(column) => <MenuItem value={column}>{column}</MenuItem>}
              </For>
            </Select>
          )}
          <StyledInput
            component={'textarea'}
            placeholder="Input the target categories. Each category in one line."
            value={rawCategories()}
            onChange={(event) => setRawCategories(event.target.value)}
            size="small"
            multiline
            rows={7}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onCancel} variant="outlined">
          Cancel
        </Button>
        {/* <Button
          onClick={() => runAnalysis('collect')}
          variant="contained"
          disabled={!analysisModel()}
        >
          Collect
        </Button> */}
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
