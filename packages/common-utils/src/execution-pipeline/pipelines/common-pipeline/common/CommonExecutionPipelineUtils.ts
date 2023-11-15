import { findValue, findValues, removeValues } from '../../../../typed';
import { RawExecutionContext } from '../../../base/context/ExecutionContext';
import {
  findContextResult,
  findContextResults,
  findResult,
  getResult,
  getContextResult,
  pushResults,
  removeResults,
  setResults,
} from '../../basic-pipeline';
import {
  CommonExecutionContext,
  CommonResultTypes,
  ExecutionErrorResult,
  ExtractMainResult,
} from '../context';
import { getUniqErrors } from '../../../../common';

// --- Utils for main result

export function findMainContextResults<
  ContextType extends CommonExecutionContext
>(context: ContextType) {
  return findContextResults<ContextType, CommonResultTypes.MAIN_RESULT>(
    context,
    CommonResultTypes.MAIN_RESULT
  );
}

export function findMainContextResult<
  ContextType extends CommonExecutionContext
>(context: ContextType) {
  return findContextResult<ContextType, CommonResultTypes.MAIN_RESULT>(
    context,
    CommonResultTypes.MAIN_RESULT
  );
}

export function getMainContextResult<
  ContextType extends CommonExecutionContext
>(context: ContextType, errorMessage?: string) {
  return getContextResult<ContextType, CommonResultTypes.MAIN_RESULT>(
    context,
    CommonResultTypes.MAIN_RESULT,
    errorMessage
  );
}

export function findMainResult<ContextType extends CommonExecutionContext>(
  context: ContextType
) {
  return findResult<ContextType, CommonResultTypes.MAIN_RESULT>(
    context,
    CommonResultTypes.MAIN_RESULT
  );
}

export function getMainResult<ContextType extends CommonExecutionContext>(
  context: ContextType,
  errorMessage?: string
) {
  return getResult<ContextType, CommonResultTypes.MAIN_RESULT>(
    context,
    CommonResultTypes.MAIN_RESULT,
    errorMessage
  );
}

export function setMainResults<ContextType extends CommonExecutionContext>(
  context: ContextType,
  ...newResults: ExtractMainResult<ContextType>[]
): void {
  const mainResults: ExtractMainResult<ContextType>[] = newResults.map(
    (resultI) => ({
      type: CommonResultTypes.MAIN_RESULT,
      value: resultI,
    })
  ) as never;
  setResults(context, ...mainResults);
}

export function removeMainResults(context: RawExecutionContext): void {
  removeValues(context.results, CommonResultTypes.MAIN_RESULT);
}

export function pushMainResults<ContextType extends CommonExecutionContext>(
  context: ContextType,
  ...newResults: ExtractMainResult<ContextType>[]
) {
  const mainResults: ExtractMainResult<ContextType>[] = newResults.map(
    (resultI) => ({
      type: CommonResultTypes.MAIN_RESULT,
      value: resultI,
    })
  ) as never;
  return pushResults(context, ...mainResults);
}

// --- Utils for Errors

/**
 * An error wrapper contains multiple sub-errors
 */
export class ExecutionError extends Error {
  constructor(public override message: string, public errors: Error[]) {
    super(message);
    this.errors = flatErrors(this.errors);
  }
}

export function flatErrors(errors: Error[]): Error[] {
  return errors.flatMap((errorI) => {
    if (errorI instanceof ExecutionError) {
      return flatErrors(errorI.errors);
    }
    return errorI;
  });
}

export function findErrors<ContextType extends CommonExecutionContext>(
  context: ContextType
): Error[] {
  return findValues(context.results, CommonResultTypes.ERROR).map(
    (errorI) => errorI.value
  );
}

export function findError<ContextType extends CommonExecutionContext>(
  context: ContextType
): Error | undefined {
  return findValue(context.results, CommonResultTypes.ERROR)?.value;
}

export function findExecutionError<ContextType extends CommonExecutionContext>(
  context: ContextType,
  message = 'Execution Error'
): ExecutionError | undefined {
  const errors = findErrors(context);
  if (!Array.isArray(errors) || errors.length <= 0) {
    return undefined;
  }
  const executionError = new ExecutionError(message, errors);
  delete executionError.stack;
  return executionError;
}

export function removeErrors<ContextType extends CommonExecutionContext>(
  context: ContextType
) {
  removeResults(context, CommonResultTypes.ERROR);
}

export function pushErrors<ContextType extends CommonExecutionContext>(
  context: ContextType,
  ...newErrors: Error[]
) {
  return context.results.push(
    ...newErrors.map(
      (errorI) =>
        ({
          type: CommonResultTypes.ERROR,
          value: errorI,
        } as ExecutionErrorResult)
    )
  );
}

/**
 * @throws {ExcutionError} An error wrapper contains multiple sub-errors
 */
export function checkAndThrowError<ContextType extends CommonExecutionContext>(
  context: ContextType
) {
  const error = findExecutionError(context);
  if (error) {
    throw error;
  }
}

export function logErrorGroup(
  errors: Error[],
  {
    logger = console.error,
    summary = false,
    details = false,
  }: {
    logger?: typeof console.error;
    summary?: boolean;
    details?: boolean;
  } = {}
) {
  const uniqErrors = getUniqErrors(errors);
  if (uniqErrors.length <= 0) {
    return;
  }
  console.group(`Execution Error: ${errors.length} error(s)`);
  uniqErrors.forEach((errorI, index) => {
    if (summary) {
      logger(`[${index}] ${errorI.message}`);
    }
    if (details) {
      logger(errorI);
    }
  });
  console.groupEnd();
}

export function logExecutionErrors(
  error: ExecutionError,
  logger = console.error
) {
  logErrorGroup(error.errors, { logger, details: true });
}

export function logExecutionErrorsSummary(
  error: ExecutionError,
  logger = console.error
) {
  logErrorGroup(error.errors, { logger, summary: true });
}

export function getFirstErrorMessage(error: ExecutionError) {
  return error?.errors?.[0]?.message || '';
}
