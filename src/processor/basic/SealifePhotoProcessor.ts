import sql from '../../../db.ts';

import { ScubaProcessor } from './scubaProcessor.ts';

export class SealifePhotoProcessor extends ScubaProcessor {
  protected entity = 'photos';

  /**
   * @inheritdoc
   */
  async getRawRecords() {
    const items = await sql`
    SELECT *
    FROM photos
    WHERE image_id IS NULL
    LIMIT 1
    FOR UPDATE SKIP LOCKED`;

    return items;
  }
}
