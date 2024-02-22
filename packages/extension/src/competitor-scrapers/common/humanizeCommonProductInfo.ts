import { CommonProductInfo } from './CommonProductInfo';

export function humanizeCommonProductInfo(
  info: CommonProductInfo,
  vendor: string,
) {
  const humanizedInfo: Record<string, unknown> = {
    [`${vendor} Rating`]: info.rating,
    [`${vendor} Reviews Count`]: info.reviewsCount,
  };
  if (info.reviewsUrl) {
    humanizedInfo[`${vendor} URL`] = info.reviewsUrl;
  }
  return humanizedInfo;
}
