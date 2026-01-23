import sql from '../../../db.ts';
import type { Image } from '../../entity/image.ts';
import { BasicProcessor } from './basicProcessor.ts';

export class ScubaProcessor extends BasicProcessor {
  async getImages() {
    // const images = await sql`SELECT * FROM photos p WHERE
    //     (
    //         p.path_thumbnail IS NULL
    //         OR
    //         p.path_medium IS NULL
    //         OR
    //         p.path_large IS NULL
    //         OR
    //         p.updated_at > p.processed_at
    //     )
    //     LIMIT 1 FOR UPDATE SKIP LOCKED
    //     `;
    const images = await sql`SELECT * FROM photos p LIMIT 10 FOR UPDATE SKIP LOCKED      
        `;


    const result: Image[] = [];
    if (images?.length > 0) {
      images.forEach((image) => {
        let error = null;
        let originalUrl = null;
        const fileName = image.photoFile.split('/').pop();
        if (!fileName) {
          error = `File name is not valid for image id ${image.id}: '${image.photoFile}'`;
          console.error(error);
        } else {
          originalUrl = `https://pub-c089cae46f7047e498ea7f80125058d5.r2.dev/${fileName}`;
        }

        result.push({
          id:          image.id,
          error:       error,
          originalUrl: originalUrl,
        });
      });
    }

    return result;
  }
}
