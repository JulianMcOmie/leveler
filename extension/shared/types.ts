/**
 * Token interface for word-level text parsing
 * Matches the original Leveler app structure
 */
export interface Token {
  word: string;
  delimiter: string; // space, dash, or empty for last word
}

/**
 * API request to get definition for selected text
 */
export interface DefinitionRequest {
  selectedText: string;
  context: string; // Surrounding sentence
  history?: string[]; // Previously explored terms (for preventing circular definitions)
}

/**
 * API response with definition
 */
export interface DefinitionResponse {
  definition: string;
  error?: string;
}

/**
 * Selection state for tracking user's text selection
 */
export interface SelectionState {
  startIndex: number;
  endIndex: number;
  tokens: Token[];
}

/**
 * Popup position coordinates
 */
export interface PopupPosition {
  x: number;
  y: number;
  placement: 'above' | 'below'; // Whether popup is above or below selection
}

/**
 * History item for recursive exploration
 */
export interface HistoryItem {
  term: string;
  definition: string;
  context: string;
}
