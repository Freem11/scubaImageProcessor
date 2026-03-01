import sql from '../../../db.ts';
import path from 'path';
import type { Image } from '../../entity/image.ts';
import { downloadFile } from '../../util/downloadFile.ts';
import { BasicProcessor } from './basicProcessor.ts';
import { getPathForImageVariant } from '../../util/getPathForImageVariant.ts';
import { uploadFile } from '../../util/uploadFile.ts';
import { getFileNameForImageVariant } from '../../util/getFileNameForImageVariant.ts';
import type { ProcessedVariantKey } from '../../entity/processedVariantKey.ts';
import type { RawRecord } from '../../entity/rawRecord.ts';

export class ScubaProcessor extends BasicProcessor {
  /**
   * Collects records from entity to be processed
   * @returns any[]
   */
  protected async getRawRecords(): Promise<RawRecord[]> {
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
          error = `No valid filename for "${this.constructor.name}.${record.id}": '${record.photoFile}'`;
        }

        if (!error) {
          const existingRecord = await this.getImageRecordByFileName(fileName);
          if (existingRecord) {
            result.push({
              id:           existingRecord,
              entity_id:    record.id,
              entity:       this.constructor.name,
              error:        error,
              fileName:     fileName,
              originalPath: '',
            });
            continue;
          }
        }

        if (!error) {
          try {
            await downloadFile(originalUrl, originalImagePath);
          } catch (e) {
            error = `Image download failed for "${this.constructor.name}.${record.id}": '${originalUrl}': ${e.message}`;
          }
        }

        result.push({
          id:           null,
          entity_id:    record.id,
          entity:       this.constructor.name,
          error:        error,
          fileName:     fileName,
          originalPath: originalImagePath,
        });
      }
    }

    return result;
  }

  async afterImageProcessed(image: Image): Promise<void> {
    if (!image.id) {
      const variantKeyMap: ProcessedVariantKey[] = [];
      for (const variant of this.config.variants) {
        const variantPath = getPathForImageVariant(image, variant);
        const absoluteVariantPath = path.resolve(variantPath);
        const newFileName = getFileNameForImageVariant(image, variant);
        const key = `variants/${variant.name}/${newFileName}`;
        await uploadFile(absoluteVariantPath, 'scubaseasons', key);
        variantKeyMap.push({
          key:         key,
          variantName: variant.name,
        });
        console.log(`Image "${this.constructor.name}.${image.entity_id}" variant ${variant.name} uploaded successfully`);
      }

      const imageId = await this.createImageRecord(image, variantKeyMap);
      image.id = imageId;
    }

    if (image.id) {
      console.log('Update only');
      await this.updateEntityRecord(image);
    }
  }

  /**
 * Updates the entity record with new image id
 * @param image - Image object with new image id
 */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async updateEntityRecord(image: Image): Promise<void> {
    // to be implemented in child classes
  }

  protected async getImageRecordByFileName(fileName: string): Promise<number | null> {
    const response = await sql`select id from images where file_name = ${fileName}`;
    if (response.length > 0) {
      return parseInt(response[0].id);
    }

    return null;
  }

  protected async createImageRecord(image: Image, processedVariants: ProcessedVariantKey[]): Promise<number> {
    const columns = {
      file_name:     image.fileName,
      updated_at:    sql`now()`,
      created_at:    sql`now()`,
      processed_at:  sql`now()`,
      public_domain: 'https://pub-2c7837e6ce9144f5bba12fc08174562f.r2.dev',
    };
    for (const processedVariant of processedVariants) {
      columns[processedVariant.variantName] = processedVariant.key;
    }

    const result = await sql`insert into images ${sql(columns, 'created_at', 'updated_at', 'processed_at', 'file_name', 'sm', 'md', 'lg', 'xl', 'public_domain')} returning id`;
    return result[0].id;
  }

  async process(): Promise<Image[]> {
    await sql`Start Transaction`;
    const result = await super.process();
    await sql`Commit`;

    return result;
  }
}
