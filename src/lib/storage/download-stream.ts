import fs from 'node:fs';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import type { Request, Response } from 'express';
import { pipeline } from 'node:stream/promises';
import type { MediaAsset } from '@prisma/client';
import { env } from '../../config/index.js';
import { getR2ObjectStream, headR2Object } from './r2.provider.js';

export type ByteRange = { start: number; end: number };

export function parseByteRange(
  rangeHeader: string | undefined,
  totalSize: number,
): ByteRange | null {
  if (!rangeHeader?.trim() || totalSize <= 0) return null;
  const match = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader.trim());
  if (!match) return null;

  let start: number;
  let end: number;

  if (match[1] === '' && match[2] !== '') {
    const suffix = Number(match[2]);
    if (!Number.isFinite(suffix) || suffix <= 0) return null;
    start = Math.max(0, totalSize - suffix);
    end = totalSize - 1;
  } else {
    start = match[1] ? Number(match[1]) : 0;
    end = match[2] ? Number(match[2]) : totalSize - 1;
  }

  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  if (start < 0 || start >= totalSize || end < start) return null;
  end = Math.min(end, totalSize - 1);
  return { start, end };
}

function sanitizeDownloadFilename(name: string): string {
  const base = path.basename(name.replace(/\\/g, '/')).replace(/[^\w.\-()+ ]/g, '_');
  return base || 'download.bin';
}

export function setDownloadHeaders(
  res: Response,
  filename: string,
  contentLength: number,
  contentType: string,
  range: ByteRange | null,
  totalSize: number,
): void {
  res.setHeader('Content-Type', contentType || 'application/octet-stream');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${sanitizeDownloadFilename(filename)}"`,
  );
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('Content-Length', String(contentLength));
  if (range) {
    res.status(206);
    res.setHeader('Content-Range', `bytes ${range.start}-${range.end}/${totalSize}`);
  } else {
    res.status(200);
  }
}

async function getLocalFileMeta(storageKey: string) {
  const filePath = path.join(path.resolve(env.STORAGE_LOCAL_PATH), storageKey);
  const stat = await fs.promises.stat(filePath);
  return { filePath, size: stat.size };
}

export async function streamMediaAssetDownload(
  asset: MediaAsset,
  req: Request,
  res: Response,
): Promise<void> {
  const filename = asset.originalName || asset.fileName;
  const range = parseByteRange(req.headers.range, asset.size);

  if (asset.storageProvider === 'R2') {
    const meta = await headR2Object(asset.storageKey, asset.bucket);
    const effectiveRange = range ?? null;
    const totalSize = meta.size;
    const streamRange =
      effectiveRange ??
      (req.headers.range ? parseByteRange(req.headers.range, totalSize) : null);

    const { stream, contentType, contentLength } = await getR2ObjectStream(
      asset.storageKey,
      asset.bucket,
      streamRange ?? undefined,
    );

    const length = streamRange
      ? streamRange.end - streamRange.start + 1
      : contentLength || totalSize;

    setDownloadHeaders(
      res,
      filename,
      length,
      contentType || asset.mimeType,
      streamRange,
      totalSize,
    );

    await pipeline(stream, res);
    return;
  }

  const { filePath, size } = await getLocalFileMeta(asset.storageKey);
  const streamRange = range ?? parseByteRange(req.headers.range, size);
  const length = streamRange ? streamRange.end - streamRange.start + 1 : size;

  setDownloadHeaders(
    res,
    filename,
    length,
    asset.mimeType,
    streamRange,
    size,
  );

  const stream = streamRange
    ? createReadStream(filePath, { start: streamRange.start, end: streamRange.end })
    : createReadStream(filePath);

  await pipeline(stream, res);
}
