import download from 'download';
import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';


export const downloadFile = async (from: string, to: string) => {
  const writer = fs.createWriteStream(to);

  // Wait for the entire pipeline to complete successfully
  await pipeline(
    download(from),
    writer,
  );
};
