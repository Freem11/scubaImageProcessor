import { spawn } from 'child_process';
import path from 'path';
import type { ImageVariant } from '../entity/imageVariant.ts';
import type { Image } from '../entity/image.ts';
import { getPathForImageVariant } from './getPathForImageVariant.ts';


export const convertImage = async (image: Image, variant: ImageVariant): Promise<boolean> => {
  const absoluteOriginalImagePath = path.resolve(image.originalPath);
  const variantPath = getPathForImageVariant(image, variant);
  const absoluteOutputPath = path.resolve(variantPath);

  // generate resize param to change image width only without upscaling
  // -resize 800x>
  const resizeParam = [`-resize`, `${variant.width}x>`];

  const args = [
    absoluteOriginalImagePath,
    ...variant.params,
    ...resizeParam,
    absoluteOutputPath,
  ];

  return new Promise<boolean>((resolve, reject) => {
    const process = spawn('magick', args);

    process.stderr.on('data', (data) => {
      reject(data);
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        reject(new Error(`ImageMagick exited with code ${code}`));
      }
    });
  });
};
