import path from 'path';
import type { imageProcessingStatistics } from '../entity/imageProcessingStatistics.ts';
import fs from 'fs';


export const saveImageStatistics = async (dirPath: string, fileName: string, statistics: imageProcessingStatistics[]) => {
  for (const variantStat of statistics) {
    if (variantStat.path) {
      const s = await fs.statSync(variantStat.path);
      variantStat.size = s.size;
    }
  }

  const fileNameWithoutExtension = fileName.split('.')[0];
  if (fileNameWithoutExtension) {
    const statDestinationPath = path.join(dirPath, fileNameWithoutExtension + '.json');
    fs.writeFile(statDestinationPath, JSON.stringify(statistics, null, 2), (err) => {
      console.log(`Unable to write statistics for  ${fileName}:`, err);
    });
  }
};
