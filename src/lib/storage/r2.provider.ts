import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { env } from '../../config/index.js';
import {
  buildDownloadStorageKey,
  sanitizeFileName,
  sanitizeFolder,
} from './file-utils.js';
import type {
  StorageDeleteInput,
  StorageUploadInput,
  StorageUploadResult,
} from './storage.types.js';

let cachedClient: S3Client | null = null;

export function isR2Configured(): boolean {
  return Boolean(
    env.R2_ACCESS_KEY_ID?.trim() &&
      env.R2_SECRET_ACCESS_KEY?.trim() &&
      env.R2_ENDPOINT?.trim(),
  );
}

function getR2Client(): S3Client {
  if (cachedClient) return cachedClient;

  cachedClient = new S3Client({
    region: 'auto',
    endpoint: env.R2_ENDPOINT!,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID!,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
  });

  return cachedClient;
}

function getPrivateBucketName(): string {
  return env.R2_PRIVATE_BUCKET_NAME?.trim() || 'woontegra-downloads';
}

export async function uploadR2Download(
  input: StorageUploadInput,
): Promise<StorageUploadResult> {
  const fileName = sanitizeFileName(input.originalName);
  const folder = sanitizeFolder(input.folder || 'products');
  const storageKey = buildDownloadStorageKey(folder, fileName);
  const bucket = getPrivateBucketName();
  const client = getR2Client();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: storageKey,
      Body: input.buffer,
      ContentType: input.mimeType || 'application/octet-stream',
    }),
  );

  return {
    storageProvider: 'R2',
    storageKey,
    bucket,
    url: null,
    publicUrl: null,
    size: input.buffer.length,
    mimeType: input.mimeType,
    fileName,
  };
}

export async function deleteR2File(input: StorageDeleteInput): Promise<void> {
  if (!input.storageKey?.trim()) return;
  const bucket = input.bucket?.trim() || getPrivateBucketName();
  const client = getR2Client();

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: input.storageKey,
    }),
  );
}

export async function headR2Object(
  storageKey: string,
  bucket?: string | null,
): Promise<{ size: number; contentType?: string }> {
  const client = getR2Client();
  const result = await client.send(
    new HeadObjectCommand({
      Bucket: bucket?.trim() || getPrivateBucketName(),
      Key: storageKey,
    }),
  );
  return {
    size: Number(result.ContentLength ?? 0),
    contentType: result.ContentType,
  };
}

export async function getR2ObjectStream(
  storageKey: string,
  bucket?: string | null,
  range?: { start: number; end: number },
) {
  const client = getR2Client();
  const result = await client.send(
    new GetObjectCommand({
      Bucket: bucket?.trim() || getPrivateBucketName(),
      Key: storageKey,
      ...(range
        ? { Range: `bytes=${range.start}-${range.end}` }
        : {}),
    }),
  );

  if (!result.Body) {
    throw new Error('R2 object body empty');
  }

  return {
    stream: result.Body as NodeJS.ReadableStream,
    contentType: result.ContentType,
    contentLength: Number(result.ContentLength ?? 0),
    totalSize: range ? undefined : Number(result.ContentLength ?? 0),
  };
}
