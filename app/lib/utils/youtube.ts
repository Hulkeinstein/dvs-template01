export function extractYouTubeId(url: string): string | null {
  if (!url) return null;

  // Regex handles:
  // - youtube.com/watch?v=ID
  // - m.youtube.com/watch?v=ID
  // - youtu.be/ID
  // - youtube.com/shorts/ID
  // - youtube.com/embed/ID
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/;

  const match = url.match(regex);
  return match ? match[1] : null;
}

export function isValidYouTubeUrl(url: string): boolean {
  return !!extractYouTubeId(url);
}

export function getYouTubeThumbnail(
  videoId: string,
  quality: 'default' | 'hq' | 'maxres' = 'hq'
): string {
  // maxresdefault is 1280x720 (may not exist for some videos)
  // hqdefault is 480x360 (safe default)
  const qualityMap = {
    default: 'default',
    hq: 'hqdefault',
    maxres: 'maxresdefault',
  };

  return `https://i.ytimg.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

export function getCanonicalUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
