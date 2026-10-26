/**
 * Cloudflare R2 Media Utilities
 * Safely usable in both Client and Server components.
 */

/**
 * Maps a local image path (e.g. '/images/logo.jpg') to its Cloudflare R2 URL.
 * If NEXT_PUBLIC_R2_URL is configured (e.g. custom CDN domain or public bucket), it uses it directly.
 * Otherwise, it routes through the high-performance Next.js streaming endpoint '/api/media/smarttv/...'.
 */
export function getR2Url(path: string): string {
  if (!path) return '';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  const publicBase = process.env.NEXT_PUBLIC_R2_URL;
  if (publicBase) {
    const base = publicBase.endsWith('/') ? publicBase.slice(0, -1) : publicBase;
    return `${base}/smarttv/${cleanPath}`;
  }

  return `/api/media/smarttv/${cleanPath}`;
}
