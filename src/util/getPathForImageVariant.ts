import path from 'path';
import type { ImageVariant } from '../entity/imageVariant.ts';
import type { Image } from '../entity/image.ts';
import { getFileNameForImageVariant } from './getFileNameForImageVariant.ts';


/**
 * Calculates where processed image variant should be saved
 * @param image Image
 * @param variant ImageVariant
 * @returns Relative path
 */
export const getPathForImageVariant = (image: Image, variant: ImageVariant): string => {
  const fileNameWithNewExtension = getFileNameForImageVariant(image, variant);
  const outputPath = path.join(variant.path, fileNameWithNewExtension).toLowerCase();

  return outputPath;
};
