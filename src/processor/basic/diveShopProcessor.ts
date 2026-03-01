import sql from '../../../db.ts';
import type { Image } from '../../entity/image.ts';
import type { RawRecord } from '../../entity/rawRecord.ts';

import { ScubaProcessor } from './scubaProcessor.ts';

export class DiveShopProcessor extends ScubaProcessor {
  protected entity = 'shops';

  /**
   * @inheritdoc
   */
  protected async getRawRecords() {
    const result: RawRecord[] = [];
    const items = await sql`
    SELECT id, "diveShopProfilePhoto"
    FROM "shops"
    WHERE
      image_id IS NULL AND
      "diveShopProfilePhoto" IS NOT NULL AND "diveShopProfilePhoto" <> ''

    LIMIT 1
    FOR UPDATE SKIP LOCKED`;

    for (const item of items) {
      result.push({
        id:        item.id,
        photoFile: item.diveShopProfilePhoto,
      });
    }

    return result;
  }

  /**
   * @inheritdoc
   */
  protected async updateEntityRecord(image: Image): Promise<void> {
    await sql`update "shops" set image_id = ${image.id} where id = ${image.entity_id}`;
  }
}
