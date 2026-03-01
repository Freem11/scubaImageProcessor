import sql from '../../../db.ts';
import type { Image } from '../../entity/image.ts';
import type { RawRecord } from '../../entity/rawRecord.ts';

import { ScubaProcessor } from './scubaProcessor.ts';

export class UserProfileProcessor extends ScubaProcessor {
  protected entity = 'UserProfiles';

  /**
   * @inheritdoc
   */
  protected async getRawRecords() {
    const result: RawRecord[] = [];
    const items = await sql`
    SELECT id, "profilePhoto"
    FROM "UserProfiles"
    WHERE 
      image_id IS NULL AND
      "profilePhoto" IS NOT NULL AND "profilePhoto" <> ''

    LIMIT 1
    FOR UPDATE SKIP LOCKED`;


    for (const item of items) {
      result.push({
        id:        item.id,
        photoFile: item.profilePhoto,
      });
    }

    return result;
  }

  /**
   * @inheritdoc
   */
  protected async updateEntityRecord(image: Image): Promise<void> {
    await sql`update "UserProfiles" set image_id = ${image.id} where id = ${image.entity_id}`;
  }
}
