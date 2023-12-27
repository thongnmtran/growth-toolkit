import { fragmentExceptNoType } from '@growth-toolkit/common-utils';
import { Checkbox, FormControlLabel } from '@suid/material';
import { FormControlLabelProps } from '@suid/material/FormControlLabel';
import { InputProps } from '@suid/material/Input';
import { Component } from 'solid-js';

const CCheckbox: Component<
  Omit<FormControlLabelProps & InputProps, 'control'>
> = (props) => {
  return (
    <FormControlLabel
      {...props}
      control={
        <Checkbox size="small" {...fragmentExceptNoType(props, 'color')} />
      }
    />
  );
};

export default CCheckbox;
