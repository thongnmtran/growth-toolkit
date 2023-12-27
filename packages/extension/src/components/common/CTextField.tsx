import TextField, { TextFieldProps } from '@suid/material/TextField';
import { Component } from 'solid-js';

const CTextField: Component<TextFieldProps> = (props) => {
  return (
    <TextField
      size="small"
      autoComplete="off"
      {...props}
      inputRef={(input) => {
        input.setAttribute('no-prevent-default', 'true');
        props.inputRef?.(input);
      }}
    />
  );
};

export default CTextField;
