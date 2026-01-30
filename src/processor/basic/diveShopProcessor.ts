import sql from '../../../db.ts';

import { ScubaProcessor } from './scubaProcessor.ts';

export class DiveShopProcessor extends ScubaProcessor {
  protected entity = 'shops';

  /**
   * @inheritdoc
   */
  async getRawRecords() {
    const items = await sql`
    SELECT id, "diveShopProfilePhoto" as "photoFile"
    FROM "shops"
    WHERE "diveShopProfilePhoto" IS NOT NULL AND "diveShopProfilePhoto" <> ''
    FOR UPDATE SKIP LOCKED`;

    return items;
  }
}
