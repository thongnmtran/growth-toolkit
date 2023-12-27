import { fragmentExceptNoType } from '@growth-toolkit/common-utils';
import { FormControl, InputLabel, MenuItem, Select } from '@suid/material';
import { SelectProps } from '@suid/material/Select';
import { Component, For, createMemo } from 'solid-js';

export type SelectOption = { value: string; label: string };
export type SimpleSelectOption = string | number | symbol;
export type AnySelectOption = SimpleSelectOption | SelectOption;

export function toSimpleOptions(values: string[]): SelectOption[] {
  return values.map((value) => ({ value, label: value }));
}

export function asOptions(values: AnySelectOption[]): SelectOption[] {
  return values.map((value) =>
    typeof value === 'object' ? value : { value, label: value },
  ) as SelectOption[];
}

export type CSelectProps = SelectProps & {
  options: AnySelectOption[];
};

const CSelect: Component<CSelectProps> = (props) => {
  const options = createMemo(() => asOptions(props.options));

  return (
    <FormControl
      sx={{ minWidth: '100px', marginTop: 'auto', marginBottom: 'auto' }}
      fullWidth={props.fullWidth}
      size="small"
    >
      <InputLabel>{props.label}</InputLabel>
      <Select
        size="small"
        {...fragmentExceptNoType(props, 'options')}
        MenuProps={{
          sx: {
            maxHeight: '600px',
          },
        }}
      >
        <For each={options()}>
          {(optionI) => (
            <MenuItem value={optionI.value}>{optionI.label}</MenuItem>
          )}
        </For>
      </Select>
    </FormControl>
  );
};

export default CSelect;
