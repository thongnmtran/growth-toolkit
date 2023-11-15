import _ from 'lodash';

export function getError<ErrorType = unknown>(
  rawError: ErrorType
): ErrorType extends undefined | null ? undefined : Error {
  const error = rawError as Error;
  if (!error || typeof error !== 'object') {
    return null as never;
  }
  return {
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...(error.cause ? { cause: getError(error.cause) } : {}),
  } as never;
}

export function getErrors(...errors: Error[]) {
  return errors.map((errorI) => getError(errorI));
}

export function getUniqErrors(errors: Error[]) {
  return _.uniqWith(getErrors(...errors), _.isEqual);
}
