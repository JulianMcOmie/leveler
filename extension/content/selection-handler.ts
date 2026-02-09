import { cleanSelectedText, extractContext } from '../shared/utils';

export interface SelectionData {
  selectedText: string;
  context: string;
  range: Range;
}

/**
 * Get the current text selection from the page
 */
export function getSelection(): SelectionData | null {
  const selection = window.getSelection();

  if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);
  const selectedText = selection.toString().trim();

  // Ignore selections that are too short or too long
  if (selectedText.length < 2 || selectedText.length > 100) {
    return null;
  }

  // Get the full text from the parent element for context extraction
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
