import { describe, it, expect } from 'vitest';
import {
  validateImage,
  validateAudio,
  validateText,
  isValidHttpUrl,
  IMAGE_MAX,
  AUDIO_MAX,
  TEXT_MAX,
} from '../lib/validators';

// Helper: create a minimal file-like object accepted by our validators
function createTestFile(size: number, type: string) {
  return { size, type };
}

describe('validateImage()', () => {
  it('accepts a valid PNG within size', () => {
    expect(validateImage(createTestFile(1024, 'image/png'))).toBeNull();
  });

  it('accepts a JPEG', () => {
    expect(validateImage(createTestFile(1024, 'image/jpeg'))).toBeNull();
  });

  it('accepts a WEBP', () => {
    expect(validateImage(createTestFile(1024, 'image/webp'))).toBeNull();
  });

  it('rejects a PDF', () => {
    expect(validateImage(createTestFile(1024, 'application/pdf'))).not.toBeNull();
  });

  it('rejects file exceeding 5MB', () => {
    expect(validateImage(createTestFile(IMAGE_MAX + 1, 'image/png'))).not.toBeNull();
  });

  it('accepts file exactly at the 5MB limit', () => {
    expect(validateImage(createTestFile(IMAGE_MAX, 'image/png'))).toBeNull();
  });

  it('rejects an empty file (size=0)', () => {
    expect(validateImage(createTestFile(0, 'image/png'))).not.toBeNull();
  });
});

describe('validateAudio()', () => {
  it('accepts audio/mpeg (mp3)', () => {
    expect(validateAudio(createTestFile(1024, 'audio/mpeg'))).toBeNull();
  });

  it('accepts audio/wav', () => {
    expect(validateAudio(createTestFile(1024, 'audio/wav'))).toBeNull();
  });

  it('accepts audio/ogg', () => {
    expect(validateAudio(createTestFile(1024, 'audio/ogg'))).toBeNull();
  });

  it('rejects an image file', () => {
    expect(validateAudio(createTestFile(1024, 'image/png'))).not.toBeNull();
  });

  it('rejects audio file exceeding 10MB', () => {
    expect(validateAudio(createTestFile(AUDIO_MAX + 1, 'audio/mpeg'))).not.toBeNull();
  });

  it('accepts file exactly at the 10MB limit', () => {
    expect(validateAudio(createTestFile(AUDIO_MAX, 'audio/mpeg'))).toBeNull();
  });
});

describe('validateText()', () => {
  it('accepts a normal message', () => {
    expect(validateText('Hello, this is a test message.')).toBeNull();
  });

  it('rejects an empty string', () => {
    expect(validateText('')).not.toBeNull();
  });

  it('rejects a whitespace-only string', () => {
    expect(validateText('   ')).not.toBeNull();
  });

  it('accepts exactly 5000 characters', () => {
    expect(validateText('a'.repeat(TEXT_MAX))).toBeNull();
  });

  it('rejects 5001 characters', () => {
    expect(validateText('a'.repeat(TEXT_MAX + 1))).not.toBeNull();
  });
});

describe('isValidHttpUrl()', () => {
  it('accepts a valid https URL', () => {
    expect(isValidHttpUrl('https://cybercrime.gov.in')).toBe(true);
  });

  it('accepts a valid http URL', () => {
    expect(isValidHttpUrl('http://example.com/path?q=1')).toBe(true);
  });

  it('rejects ftp protocol', () => {
    expect(isValidHttpUrl('ftp://example.com')).toBe(false);
  });

  it('rejects javascript: protocol', () => {
    expect(isValidHttpUrl('javascript:alert(1)')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidHttpUrl('')).toBe(false);
  });

  it('rejects plain domain without protocol', () => {
    expect(isValidHttpUrl('example.com')).toBe(false);
  });
});
