import { PutObjectCommand, type PutObjectCommandInput } from '@aws-sdk/client-s3';
import { aws3 } from '../../aws.ts';
import fs from 'node:fs';
import mime from 'mime-types';


export const uploadFile = async (filePath: string, bucketName: string, key: string) => {
  const fileStream = fs.createReadStream(filePath);
  const mimeType = mime.lookup(filePath);
  const input: PutObjectCommandInput = {
    Body:        fileStream,
    Bucket:      bucketName,
    Key:         key,
    ContentType: mimeType,
  };

  const command = new PutObjectCommand(input);
  const response = await aws3.send(command);

  return response;
};
