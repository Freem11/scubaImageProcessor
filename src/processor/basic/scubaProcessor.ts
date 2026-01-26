import sql from '../../../db.ts';
import path from 'path';
import type { Image } from '../../entity/image.ts';
import { downloadFile } from '../../util/downloadFile.ts';
import { BasicProcessor } from './basicProcessor.ts';
import { getPathForImageVariant } from '../../util/getPathForImageVariant.ts';
import { uploadFile } from '../../util/uploadFile.ts';
import { getFileNameForImageVariant } from '../../util/getFileNameForImageVariant.ts';

export class ScubaProcessor extends BasicProcessor {
  protected entity = null as string | null;

  /**
   * Collects records from this.entity to be processed
   * @returns any[]
   */
  async getRawRecords() {
    return [];
  }

  async getImages() {
    const records = await this.getRawRecords();
    const result: Image[] = [];
    if (records?.length > 0) {
      for (const record of records) {
        let error = null;
        const fileName = record.photoFile.split('/').pop();
        const originalUrl = `https://pub-c089cae46f7047e498ea7f80125058d5.r2.dev/${fileName}`;
        const originalImagePath = path.join(this.config.originalDirPath, fileName);
        if (!fileName) {
          error = `No valid filename for "${this.entity}.${record.id}": '${record.photoFile}'`;
        }

        if (!error) {
          try {
            await downloadFile(originalUrl, originalImagePath);
          } catch (e) {
            error = `Image download failed for "${this.entity}.${record.id}": '${originalUrl}': ${e.message}`;
          }
        }

        result.push({
          id:           record.id,
          entity:       this.entity,
          error:        error,
          fileName:     fileName,
          originalPath: originalImagePath,
        });
      }
    }

    return result;
  }

  async afterImageProcessed(image: Image): Promise<void> {
    const res = [];
    for (const variant of this.config.variants) {
      const variantPath = getPathForImageVariant(image, variant);
      const absoluteVariantPath = path.resolve(variantPath);
      const newFileName = getFileNameForImageVariant(image, variant);
      const key = `variants/${variant.name}/${newFileName}`;
      await uploadFile(absoluteVariantPath, 'scubaseasons', key);
      res.push({
        id:          image.id,
        key:         key,
        variantName: variant.name,
        entity:      this.entity,
      });
      console.log(`Image "${this.entity}.${image.id}" variant ${variant.name} uploaded successfully`);
    }

    const columns = {
      file_name:     image.fileName,
      updated_at:    sql`now()`,
      created_at:    sql`now()`,
      processed_at:  sql`now()`,
      public_domain: 'https://pub-2c7837e6ce9144f5bba12fc08174562f.r2.dev',
    };
    for (const item of res) {
      columns[item.variantName] = item.key;
    }

    const result = await sql`insert into images ${sql(columns, 'created_at', 'updated_at', 'processed_at', 'file_name', 'sm', 'md', 'lg', 'xl', 'public_domain')} returning id`;
    const imageId = result[0].id;
    console.log({ result });
    if (imageId) {
      await sql`update ${sql(this.entity)} set image_id = ${imageId} where id = ${image.id}`;
    }
  }

  async process(): Promise<Image[]> {
    await sql`Start Transaction`;
    const result = await super.process();
    await sql`Commit`;

    return result;
  }
}
