import { cleanSelectedText, extractContext } from '../shared/utils';

export interface SelectionData {
  selectedText: string;
  context: string;
  range: Range;
}

/**
 * Get the current text selection from the page
 */
/**
 * Expand selection to word boundaries
 */
function expandToWordBoundaries(text: string, startOffset: number, endOffset: number): { start: number; end: number } {
  // Expand backwards to word start
  while (startOffset > 0 && /\w/.test(text[startOffset - 1])) {
    startOffset--;
  }

  // Expand forwards to word end
  while (endOffset < text.length && /\w/.test(text[endOffset])) {
    endOffset++;
  }

  return { start: startOffset, end: endOffset };
}

export function getSelection(): SelectionData | null {
  const selection = window.getSelection();

  if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);
  let selectedText = selection.toString().trim();

  // Ignore selections that are too short or too long
  if (selectedText.length < 1 || selectedText.length > 100) {
    return null;
  }

  // Try to expand to word boundaries using the range
  try {
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;

    // Only expand if selection is within a single text node
    if (startContainer === endContainer && startContainer.nodeType === Node.TEXT_NODE) {
      const textContent = startContainer.textContent || '';
      let startOffset = range.startOffset;
      let endOffset = range.endOffset;

      // Expand to word boundaries
      const expanded = expandToWordBoundaries(textContent, startOffset, endOffset);
      selectedText = textContent.substring(expanded.start, expanded.end);
    }
  } catch (e) {
    // If expansion fails, use original selection
    console.log('Could not expand selection:', e);
  }

  // Ignore if still too short after expansion
  if (selectedText.length < 2) {
    return null;
  }

  // Get the full text from the parent element for context
  const parentElement = range.commonAncestorContainer.parentElement;
  if (!parentElement) {
    return null;
  }

  const fullText = parentElement.textContent || '';
  const context = extractContext(fullText, selectedText);

  return {
    selectedText: cleanSelectedText(selectedText),
    context: context,
    range: range,
  };
}

/**
 * Get the bounding rectangle of the current selection
 */
export function getSelectionRect(): DOMRect | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);
  return range.getBoundingClientRect();
}

/**
 * Clear the current selection
 */
export function clearSelection(): void {
  const selection = window.getSelection();
  if (selection) {
    selection.removeAllRanges();
  }
}
