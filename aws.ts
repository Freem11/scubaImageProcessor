import {
  S3Client,
} from '@aws-sdk/client-s3';

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretKey = process.env.R2_SECRET_KEY;

export const aws3 = new S3Client({
  region:      'auto',
  endpoint:    `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     accessKeyId,
    secretAccessKey: secretKey,
  },
});
