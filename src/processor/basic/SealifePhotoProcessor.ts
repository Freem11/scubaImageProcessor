import sql from '../../../db.ts';
import type { Image } from '../../entity/image.ts';
import type { RawRecord } from '../../entity/rawRecord.ts';

import { ScubaProcessor } from './scubaProcessor.ts';

export class SealifePhotoProcessor extends ScubaProcessor {
  protected entity = 'photos';

  /**
   * @inheritdoc
   */
  protected async getRawRecords() {
    const result: RawRecord[] = [];
    const items = await sql`
      SELECT id, "photoFile"
      FROM photos
      WHERE image_id IS NULL
      LIMIT 1
      FOR UPDATE SKIP LOCKED`;

    for (const item of items) {
      result.push({
        id:        item.id,
        photoFile: item.photoFile,
      });
    }

    return result;
  }

  /**
   * @inheritdoc
   */
  protected async updateEntityRecord(image: Image): Promise<void> {
    await sql`update "photos" set image_id = ${image.id} where id = ${image.entity_id}`;
  }
}
