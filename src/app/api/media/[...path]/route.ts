import { NextRequest, NextResponse } from 'next/server';
import { getR2Object } from '@/lib/r2-server';

const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  gif: 'image/gif',
  mp4: 'video/mp4',
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const key = path.join('/');

    let objectData;
    try {
      objectData = await getR2Object(key);
    } catch {
      if (key.startsWith('smarttv/')) {
        objectData = await getR2Object(key.replace(/^smarttv\//, ''));
      } else {
        objectData = await getR2Object(`smarttv/${key}`);
      }
    }

    if (!objectData || !objectData.Body) {
      return new NextResponse('Asset not found in R2', { status: 404 });
    }

    const byteArray = await objectData.Body.transformToByteArray();
    const ext = key.split('.').pop()?.toLowerCase() || '';
    const contentType = objectData.ContentType || MIME_TYPES[ext] || 'application/octet-stream';

    return new NextResponse(Buffer.from(byteArray), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'ETag': objectData.ETag || '',
        'Content-Length': byteArray.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error streaming from R2:', error);
    return new NextResponse('Error loading asset from R2', { status: 500 });
  }
}
