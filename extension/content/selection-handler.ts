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

    console.log('Selection info:', {
      originalText: selectedText,
      sameContainer: startContainer === endContainer,
      nodeType: startContainer.nodeType,
      isTextNode: startContainer.nodeType === Node.TEXT_NODE
    });

    if (startContainer.nodeType === Node.TEXT_NODE && endContainer.nodeType === Node.TEXT_NODE) {
      if (startContainer === endContainer) {
        // Single text node - simple case
        const textContent = startContainer.textContent || '';
        const expanded = expandToWordBoundaries(textContent, range.startOffset, range.endOffset);
        selectedText = textContent.substring(expanded.start, expanded.end);
        console.log('Single node expansion:', selectedText);
      } else {
        // Multiple text nodes - expand start and end separately
        const startText = startContainer.textContent || '';
        const endText = endContainer.textContent || '';

        // Expand start to beginning of first word
        const expandedStart = expandToWordBoundaries(startText, range.startOffset, startText.length);
        const startPart = startText.substring(expandedStart.start);

        // Expand end to end of last word
        const expandedEnd = expandToWordBoundaries(endText, 0, range.endOffset);
        const endPart = endText.substring(0, expandedEnd.end);

        // Get the middle text (everything between start and end nodes)
        const rangeClone = range.cloneRange();
        rangeClone.setStart(startContainer, expandedStart.start);
        rangeClone.setEnd(endContainer, expandedEnd.end);
        selectedText = rangeClone.toString();

        console.log('Multi-node expansion:', { startPart, endPart, full: selectedText });
      }
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
