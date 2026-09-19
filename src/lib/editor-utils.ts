/**
 * Utility functions for Tiptap story editor, statistics, slug generation, and paste cleanup.
 */

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-');
}

export function calculateReadingTime(text: string): { wordCount: number; readingTime: string } {
  if (!text || typeof text !== 'string') {
    return { wordCount: 0, readingTime: '1 min read' };
  }

  const words = text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const wordCount = words.length;
  const minutes = Math.max(1, Math.ceil(wordCount / 225));

  return {
    wordCount,
    readingTime: `${minutes} min read`,
  };
}

export function truncateAtWord(text: string, maxLen = 140): string {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLen) return clean;
  const cut = clean.substring(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  if (lastSpace > maxLen * 0.6) {
    return cut.substring(0, lastSpace).replace(/[,\s.;:!?—-]+$/, '') + '…';
  }
  return cut.replace(/[,\s.;:!?—-]+$/, '') + '…';
}

export function toRomanNumeral(num: number): string {
  const lookup: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ];
  let roman = '';
  for (const [val, symbol] of lookup) {
    while (num >= val) {
      roman += symbol;
      num -= val;
    }
  }
  return roman || String(num);
}

export function generateExcerpt(textOrHtml: string, maxLen = 220): string {
  if (!textOrHtml) return '';

  const plainText = textOrHtml
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!plainText) return '';

  const sentences = plainText.match(/[^.!?]+[.!?]+/g) || [plainText];
  const excerpt = sentences.slice(0, 2).join(' ').trim();

  return truncateAtWord(excerpt, maxLen);
}

/**
 * Clean Word / PDF pasted text:
 * - Removes standalone page numbers and header artifacts.
 * - Replaces hard line breaks inside paragraphs.
 * - Re-joins lines split mid-sentence.
 * - Preserves curly quotes, em-dashes, and vocabulary without altering wording.
 */
export function cleanPastedText(rawText: string): {
  cleanedText: string;
  modified: boolean;
  changesCount: number;
} {
  if (!rawText) {
    return { cleanedText: '', modified: false, changesCount: 0 };
  }

  let text = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  let changes = 0;

  // 1. Remove standalone page numbers on single lines or at start/end
  const pageNumberPattern = /(?:^|\n)\s*(?:page\s+)?\d+(?:\s+of\s+\d+)?\s*(?:\n|$)/gi;
  if (pageNumberPattern.test(text)) {
    text = text.replace(pageNumberPattern, () => {
      changes++;
      return '\n';
    });
  }

  // 2. Remove common PDF header/footer repeats like "Dust and Dazzle" or "Tales from a Village and a City"
  const headerPattern = /(?:^|\n)\s*(?:Dust and Dazzle|Tales from a Village and a City)\s*(?:\n|$)/gi;
  if (headerPattern.test(text)) {
    text = text.replace(headerPattern, () => {
      changes++;
      return '\n';
    });
  }

  // 3. Process paragraphs: Split into paragraph blocks (separated by 2 or more newlines)
  const rawParagraphs = text.split(/\n{2,}/);
  const cleanedParagraphs: string[] = [];

  for (const para of rawParagraphs) {
    const lines = para.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    const mergedLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (mergedLines.length === 0) {
        mergedLines.push(line);
        continue;
      }

      const prevLine = mergedLines[mergedLines.length - 1];
      const prevEndsWithPunctuation = /[.!?:;—"'”’]\s*$/.test(prevLine);
      const nextBeginsWithLowercase = /^[a-z]/.test(line);

      // If previous line does NOT end with sentence punctuation, or next begins with lowercase -> rejoin mid-sentence
      if (!prevEndsWithPunctuation || nextBeginsWithLowercase) {
        mergedLines[mergedLines.length - 1] = `${prevLine} ${line}`;
        changes++;
      } else {
        // Line break inside paragraph that seems like a continuous flow
        mergedLines[mergedLines.length - 1] = `${prevLine} ${line}`;
        changes++;
      }
    }

    cleanedParagraphs.push(mergedLines.join(' '));
  }

  const cleanedText = cleanedParagraphs.join('\n\n');
  const modified = cleanedText !== rawText.trim();

  return {
    cleanedText,
    modified,
    changesCount: changes,
  };
}
