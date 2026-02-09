import { Token } from './types';

/**
 * Parse text into tokens (words + their following delimiters)
 * Ported from Leveler app/page.tsx lines 100-117
 */
export function parseTokens(text: string): Token[] {
  const tokens: Token[] = [];
  // Split on whitespace and dashes, keeping the delimiters
  const parts = text.split(/(\s+|-)/);

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    // Skip empty parts and delimiter-only parts
    if (!part || /^(\s+|-)$/.test(part)) continue;

    // Look ahead for the delimiter
    const nextPart = parts[i + 1] || '';
    const delimiter = /^-$/.test(nextPart) ? '-' : /^\s+$/.test(nextPart) ? ' ' : '';

    tokens.push({ word: part, delimiter });
  }
  return tokens;
}

/**
 * Helper to get just the words array (without delimiters)
 * Ported from Leveler app/page.tsx lines 120-122
 */
export function parseWords(text: string): string[] {
  return parseTokens(text).map(t => t.word);
}

/**
 * Extract the sentence containing the selected text
 * Used for providing context to the API
 */
export function extractContext(fullText: string, selectedText: string): string {
  // Find the position of the selected text
  const index = fullText.indexOf(selectedText);
  if (index === -1) return selectedText;

  // Find sentence boundaries (. ! ? followed by space or end of text)
  let start = index;
  let end = index + selectedText.length;

  // Search backwards for sentence start
  while (start > 0) {
    const char = fullText[start - 1];
    if (/[.!?]/.test(char)) {
      // Found sentence boundary, but check if it's followed by space
      if (start === 1 || /\s/.test(fullText[start - 2])) {
        break;
      }
    }
    start--;
  }

  // Search forwards for sentence end
  while (end < fullText.length) {
    const char = fullText[end];
    if (/[.!?]/.test(char)) {
      end++;
      break;
    }
    end++;
  }

  return fullText.substring(start, end).trim();
}

/**
 * Clean up selected text (remove trailing punctuation)
 */
export function cleanSelectedText(text: string): string {
  return text.trim().replace(/[.,;:!?]+$/, '');
}
