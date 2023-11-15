import {
  findMainContextResult,
  findMainContextResults,
  findMainResult,
  getMainResult,
  getMainContextResult,
  pushMainResults,
  removeMainResults,
  setMainResults,
  findError,
  findErrors,
  removeErrors,
  pushErrors,
  checkAndThrowError,
  logExecutionErrors,
  ExecutionError,
  findExecutionError,
  logExecutionErrorsSummary,
} from './CommonExecutionPipelineUtils';
import { BasicContextExtractor } from '../../basic-pipeline';
import { CommonExecutionContext, ExtractMainResult } from '../context';

export class CommonContextExtractor<
  ContextType extends CommonExecutionContext
> extends BasicContextExtractor<ContextType> {
  // --- Main Result Utils

  findMainContextResults() {
    return findMainContextResults(this.context);
  }

  findMainContextResult() {
    return findMainContextResult(this.context);
  }

  getMainContextResult(errorMessage?: string) {
    return getMainContextResult(this.context, errorMessage);
  }

  findMainResult() {
    return findMainResult(this.context);
  }

  getMainResult(errorMessage?: string) {
    return getMainResult(this.context, errorMessage);
  }

  setMainResults(...newResults: ExtractMainResult<ContextType>[]): void {
    setMainResults(this.context, ...newResults);
  }

  removeMainResults(): void {
    removeMainResults(this.context);
  }

  pushMainResults(...newResults: ExtractMainResult<ContextType>[]) {
    return pushMainResults(this.context, ...newResults);
  }

  // --- Error Utils

  findErrors() {
    return findErrors(this.context);
  }

  findError() {
    return findError(this.context);
  }

  findExecutionError() {
    return findExecutionError(this.context);
  }

  removeErrors() {
    removeErrors(this.context);
  }

  pushErrors(...newErrors: Error[]) {
    pushErrors(this.context, ...newErrors);
  }

  checkAndThrowError() {
    checkAndThrowError(this.context);
  }

  logErrors() {
    try {
      this.checkAndThrowError();
    } catch (error) {
      logExecutionErrors(error as ExecutionError);
    }
  }

  logErrorsSummary(logger?: (...errors: string[]) => void) {
    try {
      this.checkAndThrowError();
    } catch (error) {
      logExecutionErrorsSummary(error as ExecutionError, logger);
    }
  }
}
