/**
 * Resolves any media URL to a fully-qualified URL safe to use in <img> tags.
 *
 * All new uploads return a full S3 URL from the backend.
 * Legacy records may have local file paths — those show a placeholder.
 */
export const getImageUrl = (image) => {
  if (!image) return '/placeholder.svg';

  // Accept plain URL string or object with various URL field names
  const url = typeof image === 'string'
    ? image
    : (image.url || image.imageUrl || image.path || '');

  if (!url) return '/placeholder.svg';

  // ✅ Absolute URL (S3, CDN, or any external source) — serve directly
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  // ⚠️ Legacy local filesystem path (stored before S3 migration) — show placeholder
  // These paths (e.g. /var/app/current/uploads/...) no longer resolve on the server.
  if (url.startsWith('/') || url.includes('uploads/')) return '/placeholder.svg';

  return '/placeholder.svg';
};
