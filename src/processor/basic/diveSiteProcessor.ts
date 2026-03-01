import sql from '../../../db.ts';
import type { Image } from '../../entity/image.ts';
import type { RawRecord } from '../../entity/rawRecord.ts';

import { ScubaProcessor } from './scubaProcessor.ts';

export class DiveSiteProcessor extends ScubaProcessor {
  protected entity = 'diveSites';

  /**
   * @inheritdoc
   */
  protected async getRawRecords() {
    const result: RawRecord[] = [];
    const items = await sql`
    SELECT id, "diveSiteProfilePhoto"
    FROM "diveSites"
    WHERE
      image_id IS NULL AND
      "diveSiteProfilePhoto" IS NOT NULL AND "diveSiteProfilePhoto" <> ''

    LIMIT 1
    FOR UPDATE SKIP LOCKED`;

    for (const item of items) {
      result.push({
        id:        item.id,
        photoFile: item.diveSiteProfilePhoto,
      });
    }

    return result;
  }

  /**
   * @inheritdoc
   */
  protected async updateEntityRecord(image: Image): Promise<void> {
    await sql`update "diveSites" set image_id = ${image.id} where id = ${image.entity_id}`;
  }
}
