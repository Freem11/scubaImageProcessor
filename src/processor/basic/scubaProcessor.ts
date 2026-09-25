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
            // Download failed (e.g. 404) — log and skip this record entirely
            console.error(`Skipping "${this.constructor.name}.${record.id}": download failed for '${originalUrl}': ${e.message}`);
            continue;
          }
        }

        if (error) {
          // Other pre-download error (e.g. no filename) — skip
          console.error(error);
          continue;
        }

        result.push({
          id:           null,
          entity_id:    record.id,
          entity:       this.constructor.name,
          error:        null,
          fileName:     fileName!,
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

        // Skip upload if the variant file doesn't exist — conversion may have
        // failed for this variant. The record stays unprocessed and will be
        // retried on the next poll cycle.
        try {
          await import('fs/promises').then(fs => fs.access(absoluteVariantPath));
        } catch {
          console.warn(`Skipping upload for ${image.fileName} variant ${variant.name} — file not found (conversion likely failed)`);
          continue;
        }

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

    // ON CONFLICT DO NOTHING guards against a race where two processor calls
    // check getImageRecordByFileName simultaneously, both get null, and both
    // attempt to insert. The second insert is silently dropped; we then fetch
    // the winner's id.
    const result = await sql`
      insert into images ${sql(columns, 'created_at', 'updated_at', 'processed_at', 'file_name', 'sm', 'md', 'lg', 'xl', 'public_domain')}
      ON CONFLICT (file_name) DO NOTHING
      returning id`;

    if (result.length > 0) {
      return result[0].id;
    }

    // Another process won the race — fetch the existing record's id
    const existing = await sql`select id from images where file_name = ${image.fileName}`;
    return parseInt(existing[0].id);
  }

  async process(): Promise<Image[]> {
    // No explicit transaction here — each image is an independent unit and
    // FOR UPDATE SKIP LOCKED in getRawRecords prevents two processors grabbing
    // the same row. Wrapping in a single transaction caused the whole batch to
    // abort when any one image hit a conflict (e.g. race on images.file_name).
    return super.process();
  }
}
