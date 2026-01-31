import sql from '../../../db.ts';

import { ScubaProcessor } from './scubaProcessor.ts';

export class DiveSiteReviewPhotosProcessor extends ScubaProcessor {
  protected entity = 'diveSiteReviewPhotos';

  /**
   * @inheritdoc
   */
  async getRawRecords() {
    const items = await sql`
    SELECT id, "photoPath" as "photoFile"
    FROM "diveSiteReviewPhotos"
    WHERE
      image_id IS NULL AND
      "photoPath" IS NOT NULL AND "photoPath" <> ''

    LIMIT 1
    FOR UPDATE SKIP LOCKED`;

    return items;
  }
}
