/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  FormControlLabel,
  Stack,
} from '@suid/material';
import { Component, createSignal } from 'solid-js';
import RocketIcon from '@/components/icons/RocketIcon';
import PieChartIcon from '@/components/icons/PieChartIcon';
import {
  CompetitorAnalysisDoc,
  CompetitorAnalysisSessionDoc,
  ExcelFile,
  ModelNames,
  mergeCompetitorSessions,
} from '@growth-toolkit/common-models';
import { modifyMutable, reconcile, unwrap } from 'solid-js/store';
import { getStore } from '@growth-toolkit/common-modules';
import CompetitorAnalysisList from './CompetitorAnalysisList';
import CompetitorAnalysisEditor from './CompetitorAnalysisEditor';
import { useCachedSignal } from '@/utils/useCachedSignal';
import { uuid } from '@growth-toolkit/common-utils';
import { fetchGoogleFile } from '@/utils/fetchGoogleFile';
import { parseExcelFile } from '@/utils/parseExcelFile';
import { copyExcelFile } from '@/utils/copyExcelFile';
import DetectIcon from '@/components/icons/DetectIcon';
import { indiaSoftware2 } from '@/competitor-scrapers/similarweb/indiaSoftware2';

export interface CompetitorAnalysisTabProps {
  onCancel?: () => void;
  onStartAnalyzingCompetitors?: (
    session: CompetitorAnalysisSessionDoc,
    isPreview: boolean,
  ) => void;
}

const CompetitorAnalysisTab: Component<CompetitorAnalysisTabProps> = (
  props,
) => {
  const [selectedModel, setSelectedModel] =
    createSignal<CompetitorAnalysisDoc>();
  const [sleepMode, setSleepMode] = useCachedSignal<boolean>('sleepMode', true);
  const [useAPI, setUseAPI] = useCachedSignal<boolean>('useAPI', true);

  const handleAnalysisChange = async (model: CompetitorAnalysisDoc) => {
    const selectedModelz = selectedModel();
    if (selectedModelz) {
      modifyMutable(selectedModelz, reconcile(model));
      const store = getStore(ModelNames.CompetitorAnalysis);
      await store.update({ doc: model });
    }
  };

  const runAnalysis = async (mode: CompetitorAnalysisSessionDoc['mode']) => {
    const model = unwrap(selectedModel());
    if (!model) {
      return;
    }
    const isPreview = mode === 'preview';
    getStore(ModelNames.AnalysisModel).update({ doc: model });

    if (model.excelFile) {
      model.excelFile.rows = JSON.parse(JSON.stringify(model.excelFile?.rows));
    }

    const store = getStore(ModelNames.CompetitorAnalysisSession);
    const oldSession = await store.find({
      query: { 'model._id': model._id },
    });
    let newSession: CompetitorAnalysisSessionDoc = {
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
        oldSession.model.productColumn !== newSession.model.productColumn;
      if (
        isFieldOverriden &&
        !window.confirm(
          'Analyze with a new field will clear the previous analyzed data. Are you sure?',
        )
      ) {
        return;
      }
      const model = await getStore(ModelNames.CompetitorModel).find({
        ref: newSession.model.model,
      });
      newSession = mergeCompetitorSessions(oldSession, newSession, model);
      await store.update({ doc: newSession });
    }
    props.onStartAnalyzingCompetitors?.(newSession, isPreview);
  };

  const getRowName = (row: any) => {
    return row['name'] || row['"name"'];
  };

  const isSameProduct = (name1: string, name2: string) => {
    const nameA = (name1 || '').toLowerCase();
    const nameB = (name2 || '').toLowerCase();
    return nameA && nameB && (nameA.includes(nameB) || nameB.includes(nameA));
  };

  const mergeData = async () => {
    const dataURLs = {
      G2: 'https://docs.google.com/spreadsheets/d/1wuDn1-dHaU9gwbGDIfDgoJCAVX-AAU1IXK8ovlP3kpU/edit#gid=884468870',
      Gartner:
        'https://docs.google.com/spreadsheets/d/1wuDn1-dHaU9gwbGDIfDgoJCAVX-AAU1IXK8ovlP3kpU/edit#gid=483595951',
      TrustRadius:
        'https://docs.google.com/spreadsheets/d/1wuDn1-dHaU9gwbGDIfDgoJCAVX-AAU1IXK8ovlP3kpU/edit#gid=71616276',
      Capterra:
        'https://docs.google.com/spreadsheets/d/1wuDn1-dHaU9gwbGDIfDgoJCAVX-AAU1IXK8ovlP3kpU/edit#gid=1139540789',
      ProductHunt:
        'https://docs.google.com/spreadsheets/d/1wuDn1-dHaU9gwbGDIfDgoJCAVX-AAU1IXK8ovlP3kpU/edit#gid=1293944130',
    };

    const datas: Record<keyof typeof dataURLs, ExcelFile> = {} as never;
    for (const [key, value] of Object.entries(dataURLs)) {
      const fileData = await fetchGoogleFile(value);
      const csv = await parseExcelFile(fileData);
      datas[key as keyof typeof dataURLs] = csv;
    }

    const rows = datas.G2.rows;
    const staticKeys = [
      'name',
      'url',
      'company',
      'isCompetitor',
      'isDirectCompetitor',
    ];
    for (const [vendor, excel] of Object.entries(datas)) {
      if (vendor === 'G2') {
        continue;
      }
      for (const row of excel.rows) {
        const g2Row = rows.find((rowI) =>
          isSameProduct(getRowName(rowI), getRowName(row)),
        );
        if (g2Row) {
          for (const [cellKey, cellValue] of Object.entries(row)) {
            if (cellKey === 'name') {
              continue;
            }
            const isEmptyCell = !g2Row[cellKey] || g2Row[cellKey] === 'unknown';
            const newCellKey = staticKeys.includes(cellKey)
              ? cellKey
              : `${vendor} ${cellKey}`;
            g2Row[newCellKey] = isEmptyCell ? cellValue : g2Row[cellKey];
          }
        } else {
          const newRow: any = {};
          for (const [cellKey, cellValue] of Object.entries(row)) {
            const newCellKey = staticKeys.includes(cellKey)
              ? cellKey
              : `${vendor} ${cellKey}`;
            newRow[newCellKey] = cellValue;
          }
          rows.push(newRow);
        }
      }
    }

    const allKeys: string[] = [];
    rows.forEach((rowI) => {
      Object.keys(rowI).forEach((key) => {
        if (!allKeys.includes(key)) {
          allKeys.push(key);
        }
      });
    });
    rows.forEach((row) => {
      allKeys.forEach((key) => {
        if (!(key in row)) {
          row[key] = undefined;
        }
      });
    });

    const asNumber = (value: any) => {
      return +value || 0;
    };

    // Calculate max rating
    rows.forEach((row) => {
      row['TrustRadius rating'] = +(
        asNumber(row['TrustRadius rating']) / 2
      ).toFixed(2);
      row['Capterra rating'] = +(asNumber(row['Capterra rating']) / 2).toFixed(
        2,
      );
      const maxRating = Math.max(
        ...[
          row['G2 Rating'],
          row['TrustRadius rating'],
          row['Capterra rating'],
          row['Gartner rating'],
          row['ProductHunt rating'],
        ].map((value) => asNumber(value)),
      );
      row['Max Rating'] = maxRating;
    });

    // Calculate max rating
    rows.forEach((row) => {
      const totalRating = [
        row['G2 Rating'],
        row['TrustRadius rating'],
        row['Capterra rating'],
        row['Gartner rating'],
        row['ProductHunt rating'],
      ]
        .map((value) => asNumber(value))
        .reduce((a, b) => a + b, 0);
      row['Total Rating'] = totalRating;
    });

    // Calculate max reviews count
    rows.forEach((row) => {
      const maxRating = Math.max(
        ...[
          row['G2 Reviews Count'],
          row['TrustRadius reviewsCount'],
          row['Capterra reviewsCount'],
          row['Gartner reviewsCount'],
          row['ProductHunt reviewsCount'],
        ].map((value) => asNumber(value)),
      );
      row['Max Reviews'] = maxRating;
    });

    // Calculate max reviews count
    rows.forEach((row) => {
      const totalRating = [
        row['G2 Reviews Count'],
        row['TrustRadius reviewsCount'],
        row['Capterra reviewsCount'],
        row['Gartner reviewsCount'],
        row['ProductHunt reviewsCount'],
      ]
        .map((value) => asNumber(value))
        .reduce((a, b) => a + b, 0);
      row['Total Reviews'] = totalRating;
    });

    const order = [
      'name',
      'Pricing Page',
      'Home Page',
      'url',
      'company',
      'isCompetitor',
      'isDirectCompetitor',
      'Max Rating',
      'Total Rating',
      'Max Reviews',
      'Total Reviews',
      'G2 Description',
      'G2 Rating',
      'G2 Reviews Count',
      'G2 Reviews URL',
      'TrustRadius description',
      'TrustRadius rating',
      'TrustRadius reviewsCount',
      'TrustRadius reviewsUrl',
      'Capterra description',
      'Capterra rating',
      'Capterra reviewsCount',
      'Capterra reviewsUrl',
      'Gartner rating',
      'Gartner reviewsCount',
      'Gartner reviewsUrl',
      'ProductHunt description',
      'ProductHunt rating',
      'ProductHunt reviewsCount',
      'ProductHunt reviewsUrl',
      'AI Features',
      'AI',
      'Built-in Report',
      'Test Management',
      'Test Planning',
      'Strong Ecosystem',
      'Collaboration',
      'Reusable Test Artifacts',
      'Low Code',
      'DDT',
      'Multiple Applicants',
      'CI/CD',
      'Parallel Execution',
      'Cloud Device Offering',
      'Scripting Languages',
      'Pricing',
      'Investments',
      'Pricing model',
      'Scripting',
      'Target Market Size',
      'Cloud Devices',
      'Free Version',
      'Self-serve',
      'Free Trial',
      'Desktop Version',
      'Generative AI',
      'Visual Testing',
      'Desktop',
      'API',
      'Web',
      'Mobile',
      'Revenue',
      'Open Source',
      'Owner',
      'Description',
    ];

    const sortedRows = rows.map((row) => {
      const newRow: any = {};
      order.forEach((key) => {
        const finalKey = key
          .replace('description', 'Description')
          .replace('rating', 'Rating')
          .replace('reviewsCount', 'Num Reviews')
          .replace('reviewsUrl', 'Reviews URL')
          .replace('company', 'Company')
          .replace('url', 'URL')
          .replace('Reviews Count', 'Num Reviews')
          .replace('name', 'Name')
          .replace('isCompetitor', 'Is Competitor')
          .replace('isDirectCompetitor', 'Is Direct Competitor');
        newRow[finalKey] = row[key];
      });
      return newRow;
    });

    console.log(sortedRows);
    copyExcelFile(sortedRows);
  };

  const processData = async () => {
    indiaSoftware2.sort((a, b) => b.Share - a.Share);
    console.log(indiaSoftware2);

    const rows = selectedModel()?.excelFile?.rows || [];
    rows.forEach((row) => {
      const anyUrl =
        row['Home Page'] && row['Home Page'] !== 'unknown'
          ? row['Home Page']
          : row['URL'];
      row['Any URL'] = anyUrl;
      if (anyUrl && anyUrl !== 'unknown') {
        row['Domain'] = new URL(anyUrl).hostname.replace('www.', '');
      }

      const record = indiaSoftware2.find((rowI) => rowI.Id === row['Domain']);
      if (record) {
        row['Category Rank - India - Similarweb'] =
          indiaSoftware2.indexOf(record) + 1;
        row['India Rank - Similarweb'] = record.Rank;
        row['India Share - Similarweb'] = record.Share;
      }
    });
    copyExcelFile(rows);
  };

  return (
    <>
      <DialogContent>
        <Stack>
          <Stack direction={'row'} spacing={2}>
            <Box width={'300px'}>
              <CompetitorAnalysisList
                onSelect={(model) => setSelectedModel(model)}
              />
            </Box>
            <CompetitorAnalysisEditor
              model={unwrap(selectedModel())}
              onChange={handleAnalysisChange}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Stack direction={'row'}>
          <FormControlLabel
            label="Sleep mode"
            control={
              <Checkbox
                size="small"
                checked={sleepMode()}
                onChange={(_event, checked) => setSleepMode(checked)}
              />
            }
            disabled={!selectedModel()}
          />
          <FormControlLabel
            label="Use API Key"
            control={
              <Checkbox
                size="small"
                checked={useAPI()}
                onChange={(_event, checked) => setUseAPI(checked)}
              />
            }
            disabled={!selectedModel()}
          />
        </Stack>
        <Button onClick={props.onCancel} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={() => mergeData()}
          variant="contained"
          startIcon={<PieChartIcon />}
        >
          Merge Data
        </Button>
        <Button
          onClick={() => processData()}
          variant="contained"
          startIcon={<DetectIcon />}
        >
          Process Data
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
          disabled={!selectedModel()}
          variant="contained"
          startIcon={<RocketIcon />}
        >
          Start Analyzing
        </Button>
      </DialogActions>
    </>
  );
};

export default CompetitorAnalysisTab;
