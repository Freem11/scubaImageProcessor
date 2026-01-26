import type { ImageVariant } from '../entity/imageVariant.ts';
import type { Image } from '../entity/image.ts';


export const getFileNameForImageVariant = (image: Image, variant: ImageVariant): string => {
  const fileNameWithoutExtension = image.fileName.split('.')[0];
  const fileNameWithNewExtension = `${fileNameWithoutExtension}.${variant.format}`;

  return fileNameWithNewExtension;
};
