export type HighlightSegment =
  | { text: string; mark: false }
  | { text: string; mark: true; phrase: string; index: number };

interface Candidate {
  start: number;
  end: number;
  phrase: string;
  phraseIndex: number;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function highlight(text: string, phrases: string[]): HighlightSegment[] {
  if (!text) {
    return [];
  }

  if (!phrases || phrases.length === 0) {
    return [{ text, mark: false }];
  }

  const candidates: Candidate[] = [];

  for (let pIdx = 0; pIdx < phrases.length; pIdx++) {
    const rawPhrase = phrases[pIdx];
    if (!rawPhrase || rawPhrase.trim().length === 0) {
      continue;
    }

    const pattern = new RegExp(escapeRegex(rawPhrase), 'gi');
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      if (end > start) {
        candidates.push({
          start,
          end,
          phrase: rawPhrase,
          phraseIndex: pIdx,
        });
      }
    }
  }

  if (candidates.length === 0) {
    return [{ text, mark: false }];
  }

  // Priority: longer phrases win, earlier wins on same start
  candidates.sort((a, b) => {
    const lenA = a.end - a.start;
    const lenB = b.end - b.start;
    if (lenA !== lenB) {
      return lenB - lenA;
    }
    if (a.start !== b.start) {
      return a.start - b.start;
    }
    return a.phraseIndex - b.phraseIndex;
  });

  const claimed = new Array<boolean>(text.length).fill(false);
  const chosen: Candidate[] = [];

  for (const candidate of candidates) {
    let hasOverlap = false;
    for (let i = candidate.start; i < candidate.end; i++) {
      if (claimed[i]) {
        hasOverlap = true;
        break;
      }
    }

    if (!hasOverlap) {
      for (let i = candidate.start; i < candidate.end; i++) {
        claimed[i] = true;
      }
      chosen.push(candidate);
    }
  }

  chosen.sort((a, b) => a.start - b.start);

  const segments: HighlightSegment[] = [];
  let cursor = 0;

  for (const match of chosen) {
    if (match.start > cursor) {
      segments.push({
        text: text.slice(cursor, match.start),
        mark: false,
      });
    }

    segments.push({
      text: text.slice(match.start, match.end),
      mark: true,
      phrase: match.phrase,
      index: match.phraseIndex,
    });

    cursor = match.end;
  }

  if (cursor < text.length) {
    segments.push({
      text: text.slice(cursor),
      mark: false,
    });
  }

  return segments;
}
