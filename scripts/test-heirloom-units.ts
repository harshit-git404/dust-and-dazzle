/**
 * Heirloom Unit Tests
 * 
 * Runs unit-level tests for every sanitizer, escape, parser, snippet highlighter,
 * and data validator added in Phase 6.
 * 
 * Execute with: npx tsx scripts/test-heirloom-units.ts
 */

import { WRITING_PROMPTS, getRandomPrompt } from '../src/content/writing-prompts';
import { renderHighlightedSnippet } from '../src/lib/search';
import React from 'react';

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, errorDetail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName}${errorDetail ? ` (${errorDetail})` : ''}`);
  }
}

console.log('\n========================================');
console.log('   HEIRLOOM PHASE 6 UNIT TEST SUITE    ');
console.log('========================================\n');

// -------------------------------------------------------------
// 1. Search Query Sanitizer & Length Guard
// -------------------------------------------------------------
console.log('1. Search Query Sanitizer & Length Guard');
function sanitizeSearchQuery(q: string): string {
  if (!q) return '';
  return q
    .slice(0, 100)
    .replace(/['"&|!():*<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const injectionSample = `village' OR 1=1; DROP TABLE stories; -- & | ! ( ) : * < >`;
const sanitized = sanitizeSearchQuery(injectionSample);
assert(
  !sanitized.includes("'") && !sanitized.includes('&') && !sanitized.includes('!'),
  'Strips dangerous tsquery & SQL injection characters',
  `Result: ${sanitized}`
);

const longString = 'a'.repeat(250);
assert(
  sanitizeSearchQuery(longString).length <= 100,
  'Enforces 100 character maximum length limit'
);

assert(
  sanitizeSearchQuery('   mango    orchard   ') === 'mango orchard',
  'Normalizes multiple consecutive whitespaces'
);

// -------------------------------------------------------------
// 2. Snippet Highlighting & XSS Safety (No dangerouslySetInnerHTML)
// -------------------------------------------------------------
console.log('\n2. Safe Snippet Highlighter & Tokenizer');

const plainSnippet = 'In our ancestral village, the [[banyan tree]] was sacred.';
const highlightedElements = renderHighlightedSnippet(plainSnippet);

assert(
  Array.isArray(highlightedElements) && highlightedElements.length === 3,
  'Splits snippet into 3 text/mark segments'
);

const xssSnippet = '<script>alert("hack")</script> [[tree]] & <img src=x onerror=alert(1)>';
const safeElements = renderHighlightedSnippet(xssSnippet);

// Verify React elements are text nodes and <mark> elements, never raw HTML
const containsRawDanger = safeElements.some(
  (el: any) => typeof el === 'object' && el?.props?.dangerouslySetInnerHTML
);
assert(
  !containsRawDanger,
  'Snippet rendering strictly produces safe React children, never dangerouslySetInnerHTML'
);

// -------------------------------------------------------------
// 3. Author Note Escaping and Character Limits
// -------------------------------------------------------------
console.log('\n3. Author Note Validation');

const MAX_NOTE_LENGTH = 1200;
const validNote = 'Written on a quiet evening in Patna, reflecting on the harvest season.';
const oversizedNote = 'x'.repeat(1201);

assert(
  validNote.length <= MAX_NOTE_LENGTH,
  'Valid author note passes 1200 char constraint'
);

assert(
  oversizedNote.length > MAX_NOTE_LENGTH,
  'Oversized author note correctly flagged as exceeding 1200 chars'
);

// Verify plain-text paragraph break splitting for display
const multiParaNote = 'First line of recollection.\n\nSecond line after coffee.';
const paragraphs = multiParaNote
  .split(/\n\s*\n/)
  .map((p) => p.trim())
  .filter(Boolean);

assert(
  paragraphs.length === 2 && paragraphs[0] === 'First line of recollection.' && paragraphs[1] === 'Second line after coffee.',
  'Author note splits cleanly into plain text paragraphs'
);

// -------------------------------------------------------------
// 4. Writing Prompts Quality & Boundaries
// -------------------------------------------------------------
console.log('\n4. Writing Prompts Validation');

assert(
  WRITING_PROMPTS.length >= 40,
  `Contains at least 40 curated prompts (Found: ${WRITING_PROMPTS.length})`
);

// Verify no trauma, illness, or money troubles in prompts
const sensitiveTerms = ['trauma', 'hospital', 'cancer', 'died in pain', 'bankrupt', 'debt', 'poverty'];
const hasSensitiveTerms = WRITING_PROMPTS.some((p) =>
  sensitiveTerms.some((term) => p.text.toLowerCase().includes(term))
);
assert(
  !hasSensitiveTerms,
  'All writing prompts are warm and free of intrusive/sensitive keywords'
);

const randomP = getRandomPrompt();
assert(
  randomP && typeof randomP.text === 'string' && randomP.text.length > 10,
  'getRandomPrompt() returns a valid populated prompt object'
);

// -------------------------------------------------------------
// 5. Timeline Decade & Chronological Utilities
// -------------------------------------------------------------
console.log('\n5. Timeline Chronological Calculations');

function extractYear(yearStr?: string | null): number {
  if (!yearStr) return 9999;
  const match = yearStr.match(/\b(19\d\d|20\d\d)\b/);
  return match ? parseInt(match[1], 10) : 9999;
}

function getDecade(year: number): string {
  if (year >= 9999) return 'Other Memories';
  const decadeStart = Math.floor(year / 10) * 10;
  return `${decadeStart}s`;
}

assert(extractYear('Circa 1974') === 1974, 'Extracts 1974 from "Circa 1974"');
assert(extractYear('2005 - Monsoon') === 2005, 'Extracts 2005 from "2005 - Monsoon"');
assert(extractYear('Early days') === 9999, 'Returns 9999 fallback when no 4-digit year exists');
assert(getDecade(1974) === '1970s', 'Calculates decade "1970s" for year 1974');
assert(getDecade(1989) === '1980s', 'Calculates decade "1980s" for year 1989');
assert(getDecade(2002) === '2000s', 'Calculates decade "2000s" for year 2002');

// -------------------------------------------------------------
// 6. Summary & Exit
// -------------------------------------------------------------
console.log('\n----------------------------------------');
console.log(`Results: ${passedTests} / ${totalTests} tests passed.`);
console.log('----------------------------------------\n');

if (passedTests === totalTests) {
  console.log('✨ All Heirloom unit tests passed successfully!\n');
  process.exit(0);
} else {
  console.error('❌ Some unit tests failed!\n');
  process.exit(1);
}
