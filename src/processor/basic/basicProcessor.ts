import type { Image } from '../../entity/image.ts';
import { convertImage } from '../../util/convertImage.ts';

import type { ImageProcessingStatistics } from '../../entity/imageProcessingStatistics.ts';

import type { ProjectConfig } from '../../entity/projectConfig.ts';
import { saveImageStatistics } from '../../util/saveImageStatistics.ts';
import type { ImageVariant } from '../../entity/imageVariant.ts';
import { getPathForImageVariant } from '../../util/getPathForImageVariant.ts';
import path from 'node:path';


export class BasicProcessor {
  config:         ProjectConfig;


  constructor(config: ProjectConfig) {
    this.config = config;
  }

  /**
   * Collects all images to be processed
   * @returns Image[]
   */
  async getImages(): Promise<Image[]> {
    return [];
  }

  /**
 * Processes a single image according to a variant config
 * @param image
 * @param variant
 * @returns Path to processed image
 */
  async processImageVariant(image: Image, variant: ImageVariant): Promise<boolean> {
    const success = await convertImage(image, variant);
    return success;
  }

  // Intentionally unused, to be overridden in a child class
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async afterImageProcessed(image: Image): Promise<void> {}

  /**
   * The entry point for the image processing
   * @returns array of processed images
   */
  async process(): Promise<Image[]> {
    const images = await this.getImages();
    for (const image of images) {
      if (image.error) {
        console.error(image.error);
        continue;
      }

      if (!image.id) {
        const stat: Array<ImageProcessingStatistics> = [];
        stat.push({ variantName: 'original', path: image.originalPath, size: NaN });
        for (const variant of this.config.variants) {
          try {
            await this.processImageVariant(image, variant);
            console.log(`Image ${image.fileName} variant ${variant.name} processed successfully`);
            const variantPath = getPathForImageVariant(image, variant);
            const absoluteOutputPath = path.resolve(variantPath);
            stat.push({ variantName: variant.name, path: absoluteOutputPath, size: NaN });
          } catch (e) {
            stat.push({ variantName: variant.name, path: '', size: NaN, error: e });
            console.error(`Error processing image ${image.fileName} variant ${variant.name}: ${e}`);
          }
        }

        saveImageStatistics(this.config.originalDirPath, image.fileName, stat);
      }
      await this.afterImageProcessed(image);
    }

    return images;
  }
}
