/* eslint-disable @typescript-eslint/no-explicit-any */
import { MultiStagesExecutionPipeline } from '../pipelines/multi-stages-pipeline/MultiStagesExecutionPipeline';
import { ExecutionParam } from '../base/context/ExecutionParam';
import {
  findContextResult,
  checkAndThrowError,
  CommonExecutionHandler,
} from '../pipelines';

export type WebTestObject = unknown;

export type WebActionTarget = WebTestObject | string | Element;

export enum KeywordParamsType {
  KEYWORD_START_TIME = 'keyword_start_time',
  TIMEOUT = 'timeout',
  TARGET = 'target', // Selector | Test Object
  SELECTOR = 'selector',
  TEST_OBJECT = 'test_object',
  ELEMENT = 'element',
  TEXT = 'text',
  ENCRYPTED_TEXT = 'encrypted_text',
}

export enum KeywordResultTypes {
  KEYWORD_RESULT = 'keyword_result',
  BROKEN_SELECTOR = 'broken_selector',
  ELEMENT = 'element',
}

const startTimeHandler: CommonExecutionHandler = async ({ ctxe }) => {
  const startTime = ctxe.findParam(KeywordParamsType.KEYWORD_START_TIME);
  if (!startTime) {
    ctxe.pushParams({
      type: KeywordParamsType.KEYWORD_START_TIME,
      value: Date.now(),
    });
  }
};

const timeoutHandler: CommonExecutionHandler = async ({
  ctxe,
  subPipeline,
}) => {
  const error = ctxe.findError();
  if (error) {
    const keywordStartTime =
      ctxe.findParam(KeywordParamsType.KEYWORD_START_TIME) || 0;
    const timeout = ctxe.findParam(KeywordParamsType.TIMEOUT) || 0;
    const isTimedOut = Date.now() - keywordStartTime > timeout;
    if (!isTimedOut) {
      ctxe.removeErrors();
      subPipeline.requestRerun();
    }
  }
};

/**
 * New:
 * - Retry with Timeout support
 * - Error handling support
 * - Self-healing support
 * - Service Injection support
 *   + Crypto Service Injection support
 * - Able to add more element finding plugin at runtime
 * - Support string selector, Test Object & WebElement as the parameter for every keyword
 */
export class NewWebEngine {
  pipeline = new MultiStagesExecutionPipeline();

  constructor(protected driver: any) {
    const targetResolver: CommonExecutionHandler = async ({ ctxe }) => {
      const isTestObject = (_target: any) => true;
      const isWebElement = (_target: any) => true;
      const target = ctxe.findParam(KeywordParamsType.TARGET);
      if (isTestObject(target)) {
        ctxe.pushParams({
          type: KeywordParamsType.TEST_OBJECT,
          value: target,
        });
      }
      if (isWebElement(target)) {
        ctxe.pushParams({
          type: KeywordParamsType.ELEMENT,
          value: target,
        });
      }
      if (typeof target === 'string') {
        ctxe.pushParams({
          type: KeywordParamsType.SELECTOR,
          value: target,
        });
      }
    };

    const selfHealingSelectorPicker: CommonExecutionHandler = async ({
      ctxe,
    }) => {
      const target = ctxe.findParam(KeywordParamsType.TARGET);
      // TODO: Find the un-broken selector
      const firstSelector = target?.css;
      ctxe.pushParams({
        type: KeywordParamsType.SELECTOR,
        value: firstSelector,
      });
    };
    const selfHealingEvaluator: CommonExecutionHandler = async ({ ctxe }) => {
      const error = ctxe.findError();
      if (error) {
        const selector = ctxe.findParam(KeywordParamsType.SELECTOR);
        if (selector) {
          ctxe.pushResults({
            type: KeywordResultTypes.BROKEN_SELECTOR,
            value: selector,
          });
        }
      }
    };

    const simpleElementFinder: CommonExecutionHandler = async ({ ctxe }) => {
      const existingElement = ctxe.findParam(KeywordParamsType.ELEMENT);
      if (existingElement) {
        return;
      }
      const parseSelector = (..._args: unknown[]) => null as any;
      const selector = parseSelector(
        ctxe.findParam(KeywordParamsType.SELECTOR)
      );
      const element = await driver.findElement(selector);
      if (element) {
        ctxe.pushParams({
          type: KeywordParamsType.ELEMENT,
          value: element,
        });
      } else {
        throw new Error(
          `No element can be found with the selector "${selector}"`
        );
      }
    };

    this.pipeline.registerBeforePreHandler(startTimeHandler, targetResolver);
    this.pipeline.registerPreHandler(selfHealingSelectorPicker);
    this.pipeline.registerAfterPreHandler(simpleElementFinder);
    this.pipeline.registerPostHandler(selfHealingEvaluator);
    this.pipeline.registerAfterPostHandler(timeoutHandler);
  }

  private async runWithTarget<ReturnType = any>(
    target: WebActionTarget,
    params: ExecutionParam[] = [],
    ...handlers: CommonExecutionHandler[]
  ) {
    const context = await this.pipeline.run({
      params: [
        {
          type: KeywordParamsType.TARGET,
          value: target,
        },
        ...params,
      ],
      handlers,
    });
    checkAndThrowError(context);
    return findContextResult(context, KeywordResultTypes.KEYWORD_RESULT)
      ?.value as ReturnType;
  }

  findElement(target: WebActionTarget) {
    const findElementHandler: CommonExecutionHandler = ({ ctxe }) => {
      const element = ctxe.findParam(KeywordParamsType.ELEMENT);
      if (element) {
        ctxe.setResults({
          type: KeywordResultTypes.KEYWORD_RESULT,
          value: element,
        });
      }
    };

    return this.runWithTarget(target, [], findElementHandler);
  }

  private elementInteractableHandler: CommonExecutionHandler = ({ ctxe }) => {
    const element = ctxe.findParam(KeywordParamsType.ELEMENT);
    ctxe.setResults({
      type: KeywordResultTypes.KEYWORD_RESULT,
      value: !!element,
    });
    if (element) {
      throw new Error('The target element is not interactable');
    }
  };

  click(target: WebActionTarget) {
    const clickHandler: CommonExecutionHandler = ({ ctxe }) => {
      const element = ctxe.findParam(KeywordParamsType.ELEMENT);
      if (!element) {
        return;
      }
      this.driver.click(element);
    };
    return this.runWithTarget(
      target,
      [],
      this.elementInteractableHandler,
      clickHandler
    );
  }

  private setTextHandler: CommonExecutionHandler = ({ ctxe }) => {
    const element = ctxe.findParam(KeywordParamsType.ELEMENT);
    if (!element) {
      return;
    }
    const text = ctxe.findParam(KeywordParamsType.TEXT);
    this.driver.setText(element, text);
  };

  setText(target: WebActionTarget, text: string) {
    return this.runWithTarget(
      target,
      [
        {
          type: KeywordParamsType.TEXT,
          value: text,
        },
      ],
      this.elementInteractableHandler,
      this.setTextHandler
    );
  }

  setEncryptedText(target: WebActionTarget, encryptedText: string) {
    return this.runWithTarget(
      target,
      [
        {
          type: KeywordParamsType.ENCRYPTED_TEXT,
          value: encryptedText,
        },
      ],
      this.elementInteractableHandler,
      this.setTextHandler
    );
  }

  verifyElementPresent(target: WebActionTarget): Promise<boolean> {
    const verifyElementPresentHandler: CommonExecutionHandler = ({ ctxe }) => {
      const element = ctxe.findParam(KeywordParamsType.ELEMENT);
      ctxe.setResults({
        type: KeywordResultTypes.KEYWORD_RESULT,
        value: !!element,
      });
      if (!element) {
        throw new Error('The element was not presented in the required time');
      }
    };

    return this.runWithTarget(target, [], verifyElementPresentHandler);
  }
}
