import { fragmentExceptNoType } from '@growth-toolkit/common-utils';
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from '@suid/material';
import { FormControlLabelProps } from '@suid/material/FormControlLabel';
import { InputProps } from '@suid/material/Input';
import { Component } from 'solid-js';

const CRadio: Component<Omit<FormControlLabelProps & InputProps, 'control'>> = (
  props,
) => {
  return (
    <FormControl>
      <FormLabel>{props.label}</FormLabel>
      <RadioGroup>
        <FormControlLabel
          {...props}
          control={
            <Radio size="small" {...fragmentExceptNoType(props, 'color')} />
          }
        />
      </RadioGroup>
    </FormControl>
  );
};

export default CRadio;
