import sql from '../../../db.ts';
import type { Image } from '../../entity/image.ts';
import type { RawRecord } from '../../entity/rawRecord.ts';

import { ScubaProcessor } from './scubaProcessor.ts';

export class DiveSiteReviewPhotosProcessor extends ScubaProcessor {
  protected entity = 'diveSiteReviewPhotos';

  /**
   * @inheritdoc
   */
  protected async getRawRecords() {
    const result: RawRecord[] = [];
    const items = await sql`
    SELECT id, "photoPath"
    FROM "diveSiteReviewPhotos"
    WHERE
      image_id IS NULL AND
      "photoPath" IS NOT NULL AND "photoPath" <> ''

    LIMIT 1
    FOR UPDATE SKIP LOCKED`;

    for (const item of items) {
      result.push({
        id:        item.id,
        photoFile: item.photoPath,
      });
    }

    return result;
  }

  /**
   * @inheritdoc
   */
  protected async updateEntityRecord(image: Image): Promise<void> {
    await sql`update "diveSiteReviewPhotos" set image_id = ${image.id} where id = ${image.entity_id}`;
  }
}
