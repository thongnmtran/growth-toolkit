/* eslint-disable @typescript-eslint/no-explicit-any */
import { Setter } from 'solid-js';

export function onChangeFromSetter(setter: Setter<any>) {
  return (event: Event) => {
    const target = event.target as HTMLInputElement;
    setter(target.value);
  };
}
