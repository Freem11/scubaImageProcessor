import { spawn } from 'child_process';
import path from 'path';
import type { ImageVariant } from '../entity/imageVariant.ts';


export const convertImage = async (originalImagePath: string, variant: ImageVariant): Promise<string> => {
  const absoluteOriginalImagePath = path.resolve(originalImagePath);
  const fileNameWithOldExtension = path.basename(originalImagePath);
  const fileName = fileNameWithOldExtension.split('.')[0];
  const fileNameWithNewExtension = `${fileName}.${variant.format}`;
  const outputPath = path.join(variant.path, fileNameWithNewExtension).toLowerCase();
  const absoluteOutputPath = path.resolve(outputPath);

  // generate resize param to change image width only without upscaling
  // -resize 800x>
  const resizeParam = [`-resize`, `${variant.width}x>`];
  const command = `magick "${absoluteOriginalImagePath}" ${variant.params.join(' ')} ${resizeParam} "${absoluteOutputPath}"`;
  console.log('executing convert command: ', command);

  const args = [
    absoluteOriginalImagePath,
    ...variant.params,
    ...resizeParam,
    absoluteOutputPath,
  ];

  return new Promise<string>((resolve, reject) => {
    const process = spawn('magick', args);

    process.stderr.on('data', (data) => {
      console.log(data.toString());
      reject(data);
    });
    process.on('close', (code) => {
      if (code === 0) {
        console.log(`Image processed and saved to ${outputPath}`);
        resolve(absoluteOutputPath);
      } else {
        reject(new Error(`ImageMagick exited with code ${code}`));
      }
    });
  });


  // return new Promise<string>((resolve, reject) => {
  //   exec(command, (err, stdout, stderr) => {
  //     if (err) {
  //       console.error(`exec error: ${err}`);
  //       reject(err);
  //       return;
  //     }
  //     console.log(`stdout: ${stdout}`);
  //     console.error(`stderr: ${stderr}`);
  //     console.log(`Image processed and saved to ${outputPath}`);
  //     resolve(absoluteOutputPath);
  //   });
  // });
};
