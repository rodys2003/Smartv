import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
export const R2_BUCKET = process.env.R2_BUCKET_NAME || 'ordely-media';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined,
  credentials:
    accessKeyId && secretAccessKey
      ? {
          accessKeyId,
          secretAccessKey,
        }
      : undefined,
});

export async function getR2Object(key: string) {
  if (!accessKeyId || !secretAccessKey || !accountId) {
    throw new Error('R2 credentials not configured in environment variables');
  }
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
  });
  return r2Client.send(command);
}
