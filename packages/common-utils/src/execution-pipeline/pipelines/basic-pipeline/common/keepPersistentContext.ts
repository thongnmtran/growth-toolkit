/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  findContextParams,
  findContextResults,
  pushParams,
  pushResults,
} from './BasicExecutionPipelineUtils';
import { RawExecutionContext } from '../../../base/context/ExecutionContext';
import { Unpacked } from '../../../../types';
import { BasicRunOptions } from './BasicRunOptions';

export function keepPersistentContext(
  context: RawExecutionContext,
  prevContext: RawExecutionContext,
  options?: BasicRunOptions<RawExecutionContext>
) {
  if (options?.persistentParams) {
    options?.persistentParams?.forEach(((
      paramKeyI: Unpacked<typeof options.persistentParams>
    ) => {
      const prevParams = findContextParams(prevContext, paramKeyI);
      pushParams(context, ...prevParams);
    }) as any);
  }
  if (options?.persistentResults) {
    options?.persistentResults?.forEach(((
      resultKeyI: Unpacked<typeof options.persistentResults>
    ) => {
      const prevResults = findContextResults(prevContext, resultKeyI);
      pushResults(context, ...prevResults);
    }) as any);
  }
}
