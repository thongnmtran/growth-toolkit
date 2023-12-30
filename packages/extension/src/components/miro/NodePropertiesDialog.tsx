/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable solid/no-innerhtml */
import {
  ModuleInfo,
  UsageGroup,
  LicenseType,
  OpportunityType,
  Opportunity,
  Competitor,
  CompetitorRecord,
} from '@/models/ModuleInfo';
import { Shape } from '@mirohq/websdk-types';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  styled,
} from '@suid/material';
import { DialogProps } from '@suid/material/Dialog';
import { Component, For, createEffect, createSignal } from 'solid-js';
import FormSection from '../common/FormSection';
import CTextField from '../common/CTextField';
import { RawSegmentFilter, myMiro } from '@/helpers/MyMiro';
import {
  createMutable,
  modifyMutable,
  produce,
  reconcile,
  unwrap,
} from 'solid-js/store';
import CCheckbox from '../common/CCheckbox';
import {
  AnyKey,
  enumValues,
  filterNull,
  set,
} from '@growth-toolkit/common-utils';
import CSelect from '../common/CSelect';
import { debounce } from '@solid-primitives/scheduled';
import DeleteIcon from '../icons/DeleteIcon';

const CardDeleteButton = styled(IconButton)({
  position: 'absolute',
  right: '8px',
  top: '8px',
  color: 'rgba(255, 0, 0, 0.3)',
  '&:hover': {
    color: 'rgba(255, 0, 0, .8)',
  },
});

interface NodePropertiesDialogProps extends DialogProps {
  node?: Shape;
  onOK?: (node: Shape, data: ModuleInfo) => void;
  onCancel?: () => void;
  segments: RawSegmentFilter[];
  competitors: Competitor[];
}

const NodePropertiesDialog: Component<NodePropertiesDialogProps> = (props) => {
  const [info, setInfo] = createSignal<ModuleInfo>();
  const node = () => props.node;

  const saveModuleInfo = debounce(async (node?: Shape, info?: ModuleInfo) => {
    if (!node || !info) {
      return;
    }
    await myMiro.saveModuleInfo(node, unwrap(info));
    await myMiro.adjustStyles();
  }, 1000);

  createEffect(() => {
    const node = props.node;
    if (!node) {
      setInfo();
      return;
    }
    (async () => {
      const cachedInfo1 = myMiro.getModuleInfo(node);
      const loadedInfo = createMutable(cachedInfo1);
      setInfo(loadedInfo);
      const cachedInfo2 = await myMiro.loadModuleInfo(node);
      modifyMutable(loadedInfo, reconcile(cachedInfo2));
    })();
  });

  function handleChange(state: any, event: any, key: any, value: any) {
    const infoz = info();
    const nodez = node();
    if (!infoz || !nodez) {
      return;
    }
    modifyMutable(
      state,
      produce((draft) => {
        const targetType = event.target.type;
        let finalValue = event.target.value;
        if (targetType === 'number') {
          finalValue = finalValue ? +finalValue : finalValue;
        } else if (targetType === 'checkbox') {
          finalValue = value;
        }
        set(draft, key, finalValue);
        return draft;
      }),
    );
    saveModuleInfo(nodez, infoz);
  }

  function handleInfoChange(key: keyof ModuleInfo | AnyKey[]) {
    const listener: any = async (event: any, value: any) => {
      const infoz = info();
      handleChange(infoz, event, key, value);
    };
    return listener;
  }

  function handleUsageChange(
    usage: UsageGroup,
    key: keyof UsageGroup | AnyKey[],
  ) {
    const listener: any = async (event: any, value: any) => {
      handleChange(usage, event, key, value);
    };
    return listener;
  }

  function handleOpportunityChange(
    opportunity: Opportunity,
    key: keyof Opportunity | AnyKey[],
  ) {
    const listener: any = async (event: any, value: any) => {
      handleChange(opportunity, event, key, value);
    };
    return listener;
  }

  function handleCompetitorChange(
    competitorRecord: CompetitorRecord,
    key: keyof CompetitorRecord | AnyKey[],
  ) {
    const listener: any = async (event: any, value: any) => {
      handleChange(competitorRecord, event, key, value);
    };
    return listener;
  }

  const handleAddUsage = () => {
    const infoz = info();
    const nodez = node();
    if (!infoz || !nodez) {
      return;
    }
    console.log(props.segments[0]?.name);
    modifyMutable(
      infoz,
      produce((draft) => {
        draft.usages.push({
          userSegmentId: props.segments[0]?.name,
        });
        return draft;
      }),
    );
    saveModuleInfo(nodez, infoz);
  };

  const handleRemoveUsage = (usage: UsageGroup) => {
    if (!window.confirm('Are you sure to delete this usage?')) {
      return;
    }
    const infoz = info();
    const nodez = node();
    if (!infoz || !nodez) {
      return;
    }
    modifyMutable(
      infoz,
      produce((draft) => {
        draft.usages.splice(unwrap(draft.usages).indexOf(unwrap(usage)), 1);
        return draft;
      }),
    );
    saveModuleInfo(nodez, infoz);
  };

  const handleAddOpporunity = () => {
    const infoz = info();
    const nodez = node();
    if (!infoz || !nodez) {
      return;
    }
    modifyMutable(
      infoz,
      produce((draft) => {
        draft.opportunities.push({
          type: OpportunityType.WON_DEAL,
          name: '',
          accountId: '',
          links: [],
          amount: 0,
          numKRELicenses: 0,
          numKSELicenses: 0,
          time: 0,
        });
        return draft;
      }),
    );
    saveModuleInfo(nodez, infoz);
  };

  const handleRemoveOpportunity = (opportunity: Opportunity) => {
    if (!window.confirm('Are you sure to delete this opportunity?')) {
      return;
    }
    const infoz = info();
    const nodez = node();
    if (!infoz || !nodez) {
      return;
    }
    modifyMutable(
      infoz,
      produce((draft) => {
        draft.opportunities.splice(
          unwrap(draft.opportunities).indexOf(unwrap(opportunity)),
          1,
        );
        return draft;
      }),
    );
    saveModuleInfo(nodez, infoz);
  };

  const handleAddCompetitor = () => {
    const infoz = info();
    const nodez = node();
    if (!infoz || !nodez) {
      return;
    }
    modifyMutable(
      infoz,
      produce((draft) => {
        draft.competitors.push({
          name: props.competitors[0]?.name || '',
          comparison: '',
          completenessLevel: 0,
          licenseType: LicenseType.FREE,
        });
        return draft;
      }),
    );
    saveModuleInfo(nodez, infoz);
  };

  const handleRemoveCompetitor = (competitor: CompetitorRecord) => {
    if (!window.confirm('Are you sure to delete this competitor?')) {
      return;
    }
    const infoz = info();
    const nodez = node();
    if (!infoz || !nodez) {
      return;
    }
    modifyMutable(
      infoz,
      produce((draft) => {
        draft.competitors.splice(
          unwrap(draft.competitors).indexOf(unwrap(competitor)),
          1,
        );
        return draft;
      }),
    );
    saveModuleInfo(nodez, infoz);
  };

  return (
    <Dialog {...props} maxWidth="xl" onClose={props.onCancel}>
      <DialogContent
        sx={{ minWidth: '500px', minHeight: '300px' }}
        no-prevent-default="true"
      >
        <Stack spacing={2}>
          <div
            innerHTML={`<style>p { margin: 0; }</style>${
              node()?.content || ''
            }`}
          />

          {info() && (
            <>
              <CTextField
                label="ID"
                value={info()?.id ?? ''}
                onChange={handleInfoChange('id')}
                fullWidth
              />
              <CTextField
                value={info()?.description ?? ''}
                onChange={handleInfoChange('description')}
                label="Description"
                multiline
                rows={3}
                fullWidth
              />
              <CTextField
                value={info()?.whenToUse ?? ''}
                onChange={handleInfoChange('whenToUse')}
                label="When to use"
                multiline
                rows={3}
                fullWidth
              />
              <CTextField
                value={info()?.docs[0] ?? ''}
                onChange={handleInfoChange(['docs', '0'])}
                label="Documents"
                placeholder='Input document URL, e.g. "https://docs.google.com/document/d/1QZ2X3"'
                fullWidth
              />
            </>
          )}

          <FormSection label="Basic Attributes">
            <Stack spacing={2}>
              {info() && (
                <>
                  <Stack direction={'row'} spacing={1}>
                    <CCheckbox
                      label="Supported"
                      checked={info()?.basicAttributes.supported ?? true}
                      onChange={handleInfoChange([
                        'basicAttributes',
                        'supported',
                      ])}
                      size={'small'}
                    />
                    <CCheckbox
                      label="Volumable"
                      checked={info()?.basicAttributes.volumable ?? true}
                      onChange={handleInfoChange([
                        'basicAttributes',
                        'volumable',
                      ])}
                      size={'small'}
                    />
                    <CSelect
                      label="License Type"
                      options={enumValues(LicenseType, [
                        LicenseType.ANY,
                        LicenseType.NOT_SET,
                      ])}
                      value={info()?.basicAttributes.licenseType}
                      onChange={(...params) => {
                        handleInfoChange(['basicAttributes', 'licenseType'])(
                          ...params,
                        );
                        handleInfoChange(['basicAttributes', 'betterToBe'])({
                          target: { value: LicenseType.NOT_SET },
                        });
                      }}
                    />
                    <CSelect
                      label="Better to be"
                      options={enumValues(
                        LicenseType,
                        filterNull([
                          LicenseType.ANY,
                          info()?.basicAttributes.licenseType,
                        ]),
                      )}
                      value={info()?.basicAttributes.betterToBe}
                      onChange={handleInfoChange([
                        'basicAttributes',
                        'betterToBe',
                      ])}
                    />
                  </Stack>
                  <Stack direction={'row'} spacing={1}>
                    <CTextField
                      label="Completeness Level"
                      value={info()?.basicAttributes.completenessLevel ?? ''}
                      onChange={handleInfoChange([
                        'basicAttributes',
                        'completenessLevel',
                      ])}
                      inputProps={{ min: 0, max: 10 }}
                      type="number"
                      placeholder="1 to 10"
                    />
                    <CTextField
                      label="Quality"
                      value={info()?.basicAttributes.quality ?? ''}
                      onChange={handleInfoChange([
                        'basicAttributes',
                        'quality',
                      ])}
                      inputProps={{ min: 0, max: 10 }}
                      type="number"
                      placeholder="1 to 10"
                    />
                  </Stack>
                </>
              )}
            </Stack>
          </FormSection>

          <FormSection label="Maslow Analysis">
            <Stack spacing={2}>
              <Stack direction={'row'} spacing={1}>
                {info() && (
                  <>
                    <CTextField
                      label="Physiological"
                      value={info()?.maslowAttributes.physiological ?? ''}
                      onChange={handleInfoChange([
                        'maslowAttributes',
                        'physiological',
                      ])}
                      inputProps={{ min: 0, max: 10 }}
                      type="number"
                      placeholder="1 to 10"
                      fullWidth
                      title="I can do my job"
                    />
                    <CTextField
                      label="Safety"
                      value={info()?.maslowAttributes.safety ?? ''}
                      onChange={handleInfoChange([
                        'maslowAttributes',
                        'safety',
                      ])}
                      inputProps={{ min: 0, max: 10 }}
                      type="number"
                      placeholder="1 to 10"
                      fullWidth
                      title="I can do my job without fear"
                    />
                    <CTextField
                      label="Love & Belonging"
                      value={info()?.maslowAttributes.love ?? ''}
                      onChange={handleInfoChange(['maslowAttributes', 'love'])}
                      inputProps={{ min: 0, max: 10 }}
                      type="number"
                      placeholder="1 to 10"
                      fullWidth
                      title="I can do my job with love and belonging"
                    />
                    <CTextField
                      label="Esteem"
                      value={info()?.maslowAttributes.esteem ?? ''}
                      onChange={handleInfoChange([
                        'maslowAttributes',
                        'esteem',
                      ])}
                      type="number"
                      inputProps={{ min: 0, max: 10 }}
                      placeholder="1 to 10"
                      fullWidth
                      title="I can do my job with respect"
                    />
                    <CTextField
                      label="Self Actualization"
                      value={info()?.maslowAttributes.selfActualization ?? ''}
                      onChange={handleInfoChange([
                        'maslowAttributes',
                        'selfActualization',
                      ])}
                      type="number"
                      inputProps={{ min: 0, max: 10 }}
                      placeholder="1 to 10"
                      fullWidth
                      title="I can do my job with self actualization"
                    />
                  </>
                )}
              </Stack>
            </Stack>
          </FormSection>

          <FormSection label="Usages">
            <Stack spacing={1}>
              <For each={info()?.usages}>
                {(usage) => (
                  <Card sx={{ position: 'relative' }}>
                    <Stack p={1} spacing={1}>
                      <Stack direction={'row'} spacing={1}>
                        <CSelect
                          label="User Segment"
                          options={props.segments.map((segment) => ({
                            label: segment.name,
                            value: segment.id,
                          }))}
                          value={usage.userSegmentId}
                          onChange={handleUsageChange(usage, 'userSegmentId')}
                        />
                        <CTextField
                          label="Need Maturity"
                          value={usage.needMaturity ?? ''}
                          onChange={handleUsageChange(usage, 'needMaturity')}
                          type="number"
                        />
                        <CTextField
                          label="Start using day"
                          value={usage.startUsingDay ?? ''}
                          onChange={handleUsageChange(usage, 'startUsingDay')}
                          type="number"
                        />
                        <CTextField
                          label="Monthly Usage"
                          value={usage.monthlyUsage ?? ''}
                          onChange={handleUsageChange(usage, 'monthlyUsage')}
                          type="number"
                        />
                      </Stack>
                      <Stack direction={'row'} spacing={1}>
                        <CTextField
                          label="Awareness Ratio"
                          value={usage.awarenessRatio ?? ''}
                          onChange={handleUsageChange(usage, 'awarenessRatio')}
                          type="number"
                          inputProps={{ min: 0, max: 100 }}
                        />
                        <CTextField
                          label="Interest ratio"
                          value={usage.interestRatio ?? ''}
                          onChange={handleUsageChange(usage, 'interestRatio')}
                          type="number"
                          inputProps={{ min: 0, max: 100 }}
                        />
                        <CTextField
                          label="Monthly Retention"
                          value={usage.monthlyRetention ?? ''}
                          onChange={handleUsageChange(
                            usage,
                            'monthlyRetention',
                          )}
                          type="number"
                          inputProps={{ min: 0, max: 100 }}
                        />
                        <CTextField
                          label="Satisfaction"
                          value={usage.satisfaction ?? ''}
                          onChange={handleUsageChange(usage, 'satisfaction')}
                          type="number"
                          inputProps={{ min: 0, max: 10 }}
                          placeholder="1 to 10"
                        />
                      </Stack>
                    </Stack>
                    <CardDeleteButton onClick={[handleRemoveUsage, usage]}>
                      <DeleteIcon />
                    </CardDeleteButton>
                  </Card>
                )}
              </For>
              <Button size="small" variant="outlined" onClick={handleAddUsage}>
                + New Usage
              </Button>
            </Stack>
          </FormSection>

          <FormSection label="Opportunities">
            <Stack spacing={1}>
              <For each={info()?.opportunities}>
                {(opportunity) => (
                  <Card sx={{ position: 'relative' }}>
                    <Stack p={1} spacing={1}>
                      <Stack direction={'row'} spacing={1}>
                        <CSelect
                          label="Type"
                          options={enumValues(OpportunityType)}
                          value={opportunity.type}
                          onChange={handleOpportunityChange(
                            opportunity,
                            'type',
                          )}
                        />
                        <CTextField
                          label="Account Name"
                          value={opportunity.name ?? ''}
                          onChange={handleOpportunityChange(
                            opportunity,
                            'name',
                          )}
                          autoComplete="off"
                        />
                        <CTextField
                          label="Account ID"
                          value={opportunity.accountId ?? ''}
                          onChange={handleOpportunityChange(
                            opportunity,
                            'accountId',
                          )}
                          autoComplete="off"
                        />
                      </Stack>
                      <Stack direction={'row'} spacing={1}>
                        <CTextField
                          label="Amount"
                          value={opportunity.amount ?? ''}
                          onChange={handleOpportunityChange(
                            opportunity,
                            'amount',
                          )}
                          type="number"
                        />
                        <CTextField
                          label="Number of KSE Licenses"
                          value={opportunity.numKSELicenses ?? ''}
                          onChange={handleOpportunityChange(
                            opportunity,
                            'numKRELicenses',
                          )}
                          type="number"
                        />
                        <CTextField
                          label="Number of KSR Licenses"
                          value={opportunity.numKRELicenses ?? ''}
                          onChange={handleOpportunityChange(
                            opportunity,
                            'numKRELicenses',
                          )}
                          type="number"
                        />
                      </Stack>
                    </Stack>
                    <CardDeleteButton
                      onClick={[handleRemoveOpportunity, opportunity]}
                    >
                      <DeleteIcon />
                    </CardDeleteButton>
                  </Card>
                )}
              </For>
              <Button
                size="small"
                variant="outlined"
                onClick={handleAddOpporunity}
              >
                + New Opportunity
              </Button>
            </Stack>
          </FormSection>

          <FormSection label="Competitors">
            <Stack spacing={1}>
              <For each={info()?.competitors}>
                {(competitor) => (
                  <Card sx={{ position: 'relative' }}>
                    <Stack direction={'row'} spacing={1}>
                      <Stack py={1} pl={1} spacing={1}>
                        <CSelect
                          label="Name"
                          options={props.competitors.map(
                            (competitor) => competitor.name,
                          )}
                          value={competitor.name}
                          onChange={handleCompetitorChange(competitor, 'name')}
                        />
                        <CTextField
                          label="Completeness Level"
                          value={competitor.completenessLevel ?? ''}
                          onChange={handleCompetitorChange(
                            competitor,
                            'completenessLevel',
                          )}
                          type="number"
                          fullWidth
                        />
                        <CSelect
                          label="License Type"
                          options={enumValues(LicenseType, [
                            LicenseType.ANY,
                            LicenseType.NOT_SET,
                          ])}
                          value={competitor.licenseType}
                          onChange={handleCompetitorChange(
                            competitor,
                            'licenseType',
                          )}
                        />
                      </Stack>
                      <Box py={1} flex="1 1 auto">
                        <CTextField
                          label="Comparison"
                          value={competitor.comparison ?? ''}
                          onChange={handleCompetitorChange(
                            competitor,
                            'comparison',
                          )}
                          placeholder='Input comparison, e.g. "Better at this and that"'
                          fullWidth
                          multiline
                          rows={3}
                        />
                      </Box>
                    </Stack>
                    <CardDeleteButton
                      onClick={[handleRemoveCompetitor, competitor]}
                    >
                      <DeleteIcon />
                    </CardDeleteButton>
                  </Card>
                )}
              </For>
              <Button
                size="small"
                variant="outlined"
                onClick={handleAddCompetitor}
              >
                + New Competitor
              </Button>
            </Stack>
          </FormSection>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default NodePropertiesDialog;
