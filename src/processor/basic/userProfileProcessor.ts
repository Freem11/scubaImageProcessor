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
    WHERE "profilePhoto" IS NOT NULL AND "profilePhoto" <> ''
    FOR UPDATE SKIP LOCKED`;

    return items;
  }
}
