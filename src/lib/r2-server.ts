import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const accountId = process.env.R2_ACCOUNT_ID || 'b2188e7ded12ab505b6526e220673976';
const accessKeyId = process.env.R2_ACCESS_KEY_ID || '692cf296af2d2d24069f41195b9ec8c4';
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '482d513ca01b60d2361ebb073268c921f3da82f73eabf8178d48fe9f4c9bf44c';
export const R2_BUCKET = process.env.R2_BUCKET_NAME || 'ordely-media';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export async function getR2Object(key: string) {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
  });
  return r2Client.send(command);
}
