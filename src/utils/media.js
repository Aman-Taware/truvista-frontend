export const getImageUrl = (image) => {
  if (!image) return '/placeholder.svg';
  const url = image.url || image.imageUrl || image.path;
  if (url && url.startsWith('/')) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    return `${baseUrl}${url}`;
  }
  return url || '/placeholder.svg';
};
