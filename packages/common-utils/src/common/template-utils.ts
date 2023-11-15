/* eslint-disable @typescript-eslint/no-explicit-any */
import * as StringTemplateParser from 'string-template-parser';
import { toTitleCase } from './string-utils';

const { parseStringTemplateGenerator, evaluateParsedString } = ((
  StringTemplateParser as any
).default || StringTemplateParser) as typeof StringTemplateParser;

const parser = parseStringTemplateGenerator({
  VARIABLE_START: /^\{\s*/,
  VARIABLE_END: /^\s*\}/,
  PIPE_START: /^:\s*/,
  PIPE_PARAMETER_START: /^:\s*/,
});

/**
 * `Hi {name:inHoa:inThuong}`
 */
export function parseTemplate(template: string, context: object) {
  return evaluateParsedString(parser(template), context, {
    inHoa: (value) => toTitleCase(value),
  });
}
