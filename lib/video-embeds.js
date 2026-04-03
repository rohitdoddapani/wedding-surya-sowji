const YOUTUBE_HOSTS = new Set(['youtu.be', 'www.youtu.be', 'youtube.com', 'www.youtube.com', 'm.youtube.com']);
const VIMEO_HOSTS = new Set(['vimeo.com', 'www.vimeo.com', 'player.vimeo.com']);
const DRIVE_HOSTS = new Set(['drive.google.com', 'www.drive.google.com']);

function safeUrl(input) {
  try {
    return new URL(input);
  } catch {
    return null;
  }
}

function normalizeYouTube(url) {
  if (url.hostname === 'youtu.be') {
    const id = url.pathname.replace('/', '');
    if (!id) return null;
    return {
      provider: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${id}`,
      thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    };
  }

  const videoId = url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).at(-1);
  if (!videoId) return null;

  return {
    provider: 'youtube',
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  };
}

function normalizeVimeo(url) {
  const parts = url.pathname.split('/').filter(Boolean);
  const videoId = parts.at(-1);
  if (!videoId || Number.isNaN(Number(videoId))) return null;

  return {
    provider: 'vimeo',
    embedUrl: `https://player.vimeo.com/video/${videoId}`,
    thumbnailUrl: '',
  };
}

function normalizeDrive(url) {
  const parts = url.pathname.split('/').filter(Boolean);
  const fileIndex = parts.findIndex((part) => part === 'd');
  const fileId = url.searchParams.get('id') || (fileIndex >= 0 ? parts[fileIndex + 1] : null) || parts.at(-1);

  if (!fileId) return null;

  return {
    provider: 'google-drive',
    embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
    thumbnailUrl: '',
  };
}

export function normalizeVideoUrl(rawUrl) {
  const parsed = safeUrl(rawUrl);
  if (!parsed) throw new Error('Enter a valid video URL.');

  if (YOUTUBE_HOSTS.has(parsed.hostname)) {
    const normalized = normalizeYouTube(parsed);
    if (!normalized) throw new Error('This YouTube URL is missing a video id.');
    return normalized;
  }

  if (VIMEO_HOSTS.has(parsed.hostname)) {
    const normalized = normalizeVimeo(parsed);
    if (!normalized) throw new Error('This Vimeo URL is missing a numeric video id.');
    return normalized;
  }

  if (DRIVE_HOSTS.has(parsed.hostname)) {
    const normalized = normalizeDrive(parsed);
    if (!normalized) throw new Error('This Google Drive URL is missing a file id.');
    return normalized;
  }

  throw new Error('Only YouTube, Vimeo, and Google Drive links are supported in v1.');
}
