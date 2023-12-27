import { Component } from 'solid-js';

interface CustomSegmentEditorProps {}

const CustomSegmentEditor: Component<CustomSegmentEditorProps> = (props) => {
  return (
    <Stack direction={'row'} spacing={1}>
      <CTextField
        value={usage.name ?? ''}
        onChange={handleUsageChange(usage, 'name')}
        label="Group Name"
        multiline
        rows={3}
        fullWidth
      />
      <CSelect
        label="License Type"
        options={enumValues(LicenseType, [LicenseType.ANY]) as never}
        value={usage.licenseType}
        onChange={handleUsageChange(usage, 'userSegment')}
      />
      <CSelect
        label="User Experience"
        options={enumValues(LicenseType, [LicenseType.ANY]) as never}
        value={usage.userExperience}
        onChange={handleUsageChange(usage, 'userExperience')}
      />
      <CSelect
        label="Katalon Experience"
        options={enumValues(LicenseType, [LicenseType.ANY]) as never}
        value={usage.katalonExperience}
        onChange={handleUsageChange(usage, 'katalonExperience')}
      />
      <CSelect
        label="Katalon Experience"
        options={enumValues(LicenseType, [LicenseType.ANY]) as never}
        value={usage.katalonExperience}
        onChange={handleInfoChange(['basicAttributes', 'accessLevel'])}
      />
    </Stack>
  );
};

export default CustomSegmentEditor;
