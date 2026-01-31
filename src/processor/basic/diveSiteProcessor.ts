import sql from '../../../db.ts';

import { ScubaProcessor } from './scubaProcessor.ts';

export class DiveSiteProcessor extends ScubaProcessor {
  protected entity = 'diveSites';

  /**
   * @inheritdoc
   */
  async getRawRecords() {
    const items = await sql`
    SELECT id, "diveSiteProfilePhoto" as "photoFile"
    FROM "diveSites"
    WHERE
      image_id IS NULL AND
      "diveSiteProfilePhoto" IS NOT NULL AND "diveSiteProfilePhoto" <> ''

    LIMIT 1
    FOR UPDATE SKIP LOCKED`;

    return items;
  }
}
