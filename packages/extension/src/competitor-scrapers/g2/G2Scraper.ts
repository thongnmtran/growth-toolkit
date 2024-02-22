import { getElementText } from '@/helpers/automator';
import { CommonProductInfo } from '../common/CommonProductInfo';

export class G2Scraper {
  async scrape(): Promise<CommonProductInfo | undefined> {
    const reviewsCount = Number.parseInt(
      getElementText('.filters-product h3').replace(',', ''),
    );
    const rating = Number.parseFloat(
      getElementText('.filters-product .fw-semibold'),
    );
    return {
      rating,
      reviewsCount,
    };
  }
}
