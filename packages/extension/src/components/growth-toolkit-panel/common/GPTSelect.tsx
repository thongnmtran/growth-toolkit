import { FormControl, InputLabel } from '@suid/material';
import { SelectProps } from '@suid/material/Select';
import { Component, For } from 'solid-js';

export type GPTSelectProps = SelectProps;

const GPTSelect: Component<GPTSelectProps> = (props) => {
  return (
    <FormControl fullWidth>
      <InputLabel>Target field</InputLabel>
      <Select
        size="small"
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
        <For each={model()?.excelFile?.headers || []}>
          {(column) => <MenuItem value={column}>{column}</MenuItem>}
        </For>
      </Select>
    </FormControl>
  );
};

export default GPTSelect;
