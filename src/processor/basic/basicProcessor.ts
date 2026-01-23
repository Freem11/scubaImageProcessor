import path from 'path';
import sql from '../../../db.ts';
import type { Image } from '../../entity/image.ts';
import { convertImage } from '../../util/convertImage.ts';
import { downloadFile } from '../../util/downloadFile.ts';
import type { imageProcessingStatistics } from '../../entity/imageProcessingStatistics.ts';

import type { ProjectConfig } from '../../entity/projectConfig.ts';
import { saveImageStatistics } from '../../util/saveImageStatistics.ts';


export class BasicProcessor {
  config:         ProjectConfig;


  constructor(config: ProjectConfig) {
    this.config = config;
  }

  async getImages(): Promise<Image[]> {
    return [];
  }

  async processImage(image: Image): Promise<void> {
    const fileName = path.basename(image.originalUrl);
    const originalImagePath = path.join(this.config.originalDirPath, fileName);

    try {
      await downloadFile(image.originalUrl, originalImagePath);
      console.log(`Image downloaded successfully for image id ${image.id}: '${image.originalUrl}'`);
    } catch (error) {
      console.error(`Image downloading failed for image id ${image.id}: '${image.originalUrl}':`, error.message);
      throw error;
    }

    const stat: Array<imageProcessingStatistics> = [];
    stat.push({ variantName: 'original', path: originalImagePath, size: NaN });
    for (const variant of this.config.variants) {
      try {
        const outputImagePath = await convertImage(originalImagePath, variant);
        stat.push({ variantName: variant.name, path: outputImagePath, size: NaN });
      } catch (error) {
        stat.push({ variantName: variant.name, path: '', size: NaN, error: error });
      }
    }
    saveImageStatistics(this.config.originalDirPath, fileName, stat);
  }

  async process(): Promise<Image[]> {
    await sql`Start Transaction`;
    const images = await this.getImages();
    for (const image of images) {
      await this.processImage(image);
      // await new Promise(resolve => setTimeout(resolve, 5000));
    }
    await sql`Commit`;

    return images;
  }
}
