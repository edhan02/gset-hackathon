export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
export const AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/mp4',
  'audio/webm',
];
export const IMAGE_MAX = 5 * 1024 * 1024; // 5 MB
export const AUDIO_MAX = 10 * 1024 * 1024; // 10 MB
export const TEXT_MAX = 5000;

export function validateImage(file: { type: string; size: number }): string | null {
  if (!file || typeof file.size !== 'number' || typeof file.type !== 'string') {
    return 'Invalid file object';
  }
  if (file.size <= 0) {
    return 'File is empty';
  }
  if (file.size > IMAGE_MAX) {
    return 'Image size must not exceed 5MB';
  }
  if (!IMAGE_TYPES.includes(file.type.toLowerCase())) {
    return 'Unsupported image format. Allowed: PNG, JPEG, WEBP';
  }
  return null;
}

export function validateAudio(file: { type: string; size: number }): string | null {
  if (!file || typeof file.size !== 'number' || typeof file.type !== 'string') {
    return 'Invalid file object';
  }
  if (file.size <= 0) {
    return 'File is empty';
  }
  if (file.size > AUDIO_MAX) {
    return 'Audio size must not exceed 10MB';
  }
  if (!AUDIO_TYPES.includes(file.type.toLowerCase())) {
    return 'Unsupported audio format. Allowed: MP3, WAV, OGG, MP4, WEBM';
  }
  return null;
}

export function validateText(text: string): string | null {
  if (text === null || text === undefined || text.trim().length === 0) {
    return 'Text input cannot be empty';
  }
  if (text.length > TEXT_MAX) {
    return 'Text exceeds maximum length of 5000 characters';
  }
  return null;
}

export function isValidHttpUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
