import sql from '../../../db.ts';

import { ScubaProcessor } from './scubaProcessor.ts';

export class UserProfileProcessor extends ScubaProcessor {
  protected entity = 'UserProfiles';

  /**
   * @inheritdoc
   */
  async getRawRecords() {
    const items = await sql`
    SELECT id, "profilePhoto" as "photoFile"
    FROM "UserProfiles"
    WHERE 
      image_id IS NULL AND
      "profilePhoto" IS NOT NULL AND "profilePhoto" <> ''

    LIMIT 1
    FOR UPDATE SKIP LOCKED`;

    return items;
  }
}
