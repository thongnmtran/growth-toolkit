import GlobalStore from '@/helpers/GlobalStore';
import { Signal, createEffect, createSignal } from 'solid-js';

export function useCachedSignal<Type>(
  key: string,
  initialValue: Type,
): Signal<Type> {
  GlobalStore.prefix = 'growth-toolkit-';
  const defaultValue =
    typeof initialValue === 'string'
      ? GlobalStore.get(key, initialValue) || initialValue
      : GlobalStore.get(key, initialValue);
  const [value, setValue] = createSignal(defaultValue);
  createEffect(() => {
    GlobalStore.set(key, value());
  });
  return [value, setValue];
}
