import { describe, it, expect } from 'vitest';
import { highlight } from '../lib/highlight';

describe('highlight()', () => {
  it('returns the full text as non-mark when no phrases given', () => {
    const segs = highlight('Hello world', []);
    expect(segs).toHaveLength(1);
    expect(segs[0]).toEqual({ text: 'Hello world', mark: false });
  });

  it('marks a phrase found once', () => {
    const segs = highlight('You are under arrest now', ['arrest']);
    const marks = segs.filter((s) => s.mark);
    expect(marks).toHaveLength(1);
    expect(marks[0].text.toLowerCase()).toBe('arrest');
  });

  it('marks all occurrences of a repeated phrase', () => {
    const text = 'CBI called. The CBI officer said CBI will arrest you.';
    const segs = highlight(text, ['CBI']);
    const marks = segs.filter((s) => s.mark);
    expect(marks).toHaveLength(3);
    marks.forEach((m) => expect(m.text.toLowerCase()).toBe('cbi'));
  });

  it('longer phrase wins over shorter overlapping phrase', () => {
    const text = 'CBI officer called you';
    // "CBI officer" is longer than "CBI" — it should win
    const segs = highlight(text, ['CBI', 'CBI officer']);
    const marks = segs.filter((s) => s.mark);
    expect(marks).toHaveLength(1);
    expect(marks[0].text.toLowerCase()).toBe('cbi officer');
  });

  it('handles regex-special characters in phrases without throwing', () => {
    const text = 'The CBI (official) notice (fraudulent)';
    // Should not throw; should find "(official)"
    const segs = highlight(text, ['(official)']);
    const marks = segs.filter((s) => s.mark);
    expect(marks).toHaveLength(1);
    expect(marks[0].text).toBe('(official)');
  });

  it('returns no marks when phrase is not found in text', () => {
    const segs = highlight('Hello world', ['arrest']);
    const marks = segs.filter((s) => s.mark);
    expect(marks).toHaveLength(0);
    // Still returns the text
    expect(segs[0]).toEqual({ text: 'Hello world', mark: false });
  });

  it('is case-insensitive', () => {
    const segs = highlight('ARREST this person', ['arrest']);
    const marks = segs.filter((s) => s.mark);
    expect(marks).toHaveLength(1);
    expect(marks[0].text).toBe('ARREST');
  });

  it('returns empty array for empty text', () => {
    const segs = highlight('', ['arrest']);
    expect(segs).toHaveLength(0);
  });

  it('non-overlapping: two different phrases in same text', () => {
    const text = 'You will be arrested and pay fine immediately';
    const segs = highlight(text, ['arrested', 'pay fine']);
    const marks = segs.filter((s) => s.mark);
    expect(marks).toHaveLength(2);
    const texts = marks.map((m) => m.text.toLowerCase());
    expect(texts).toContain('arrested');
    expect(texts).toContain('pay fine');
  });
});
