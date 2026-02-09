import { getSelection, getSelectionRect } from './selection-handler';
import { fetchDefinition } from '../shared/api-client';
import { PopupManager } from './popup-manager';
import { HistoryItem } from '../shared/types';

// Global state
let popupManager: PopupManager | null = null;
let isProcessing = false;
const explorationHistory: HistoryItem[] = [];

/**
 * Handle recursive selection within a popup
 */
async function handleRecursiveSelection(selectedText: string, popupRect: DOMRect): Promise<void> {
  if (isProcessing) {
    return;
  }

  isProcessing = true;

  try {
    // Close existing popup
    if (popupManager) {
      popupManager.close();
    }

    // Create new popup manager
    popupManager = new PopupManager();
    const hasHistory = explorationHistory.length > 0;
    popupManager.show(popupRect, 'Loading...', true, selectedText, hasHistory); // Show term and back button immediately

    // Fetch definition from API using only the term names for usedTerms
    const usedTerms = explorationHistory.map(item => item.term);
    const response = await fetchDefinition({
      selectedText: selectedText,
      context: selectedText, // For recursive lookups, use the word itself as context
      history: usedTerms,
    });

    if (response.error) {
      popupManager.showError(response.error);
    } else {
      const currentPopup = popupManager;
      const hasHistory = explorationHistory.length > 0;

      popupManager.showDefinition(
        response.definition,
        selectedText, // Current term
        hasHistory, // Show back button if there's history
        () => {
          // Callback when popup is closed
          explorationHistory.length = 0;
        },
        (nextSelectedText: string) => {
          // Add current exploration to history before going deeper
          explorationHistory.push({
            term: selectedText,
            definition: response.definition,
            context: selectedText,
          });

          // Recursive callback for deeper exploration
          handleRecursiveSelection(nextSelectedText, currentPopup.getRect());
        },
        () => {
          // Back button callback
          if (explorationHistory.length > 0) {
            const previousItem = explorationHistory.pop()!;

            // Close current popup
            currentPopup.close();

            // Create new popup with previous definition
            const newPopup = new PopupManager();
            const stillHasHistory = explorationHistory.length > 0;
            newPopup.show(currentPopup.getRect(), previousItem.definition, true, previousItem.term, stillHasHistory);

            newPopup.showDefinition(
              previousItem.definition,
              previousItem.term,
              stillHasHistory,
              () => {
                explorationHistory.length = 0;
              },
              (nextSelectedText: string) => {
                explorationHistory.push({
                  term: previousItem.term,
                  definition: previousItem.definition,
                  context: previousItem.context,
                });
                handleRecursiveSelection(nextSelectedText, newPopup.getRect());
              },
              () => {
                // Recursive back button for the restored popup
                if (explorationHistory.length > 0) {
                  const prev = explorationHistory.pop()!;
                  newPopup.close();
                  const restoredPopup = new PopupManager();
                  const hasMoreHistory = explorationHistory.length > 0;
                  restoredPopup.show(newPopup.getRect(), prev.definition, true, prev.term, hasMoreHistory);
                  restoredPopup.showDefinition(
                    prev.definition,
                    prev.term,
                    hasMoreHistory
                  );
                  popupManager = restoredPopup;
                }
              }
            );

            popupManager = newPopup;
          }
        }
      );
    }
  } catch (error) {
    console.error('Error handling recursive selection:', error);
    if (popupManager) {
      popupManager.showError('Failed to fetch definition');
    }
  } finally {
    isProcessing = false;
  }
}

/**
 * Handle text selection on the page
 */
async function handleTextSelection(): Promise<void> {
  // Avoid handling selections within our own popup
  const target = document.activeElement;
  if (target && target.closest('#leveler-popup')) {
    return;
  }

  const selectionData = getSelection();
  if (!selectionData || isProcessing) {
    return;
  }

  const selectionRect = getSelectionRect();
  if (!selectionRect) {
    return;
  }

  isProcessing = true;

  try {
    // Close existing popup if any
    if (popupManager) {
      popupManager.close();
    }

    // Create new popup manager
    popupManager = new PopupManager();
    popupManager.show(selectionRect, 'Loading...', false, selectionData.selectedText, false); // Show term immediately, no back button

    // Fetch definition from API
    const response = await fetchDefinition({
      selectedText: selectionData.selectedText,
      context: selectionData.context,
      history: explorationHistory,
    });

    if (response.error) {
      popupManager.showError(response.error);
    } else {
      const currentPopup = popupManager;
      popupManager.showDefinition(
        response.definition,
        selectionData.selectedText, // Current term
        false, // No back button for initial selection
        () => {
          // Callback when popup is closed
          // Clear exploration history when closing
          explorationHistory.length = 0;
        },
        (selectedText: string) => {
          // Add current exploration to history before going deeper
          explorationHistory.push({
            term: selectionData.selectedText,
            definition: response.definition,
            context: selectionData.context,
          });

          // Callback when word is selected within popup for recursive exploration
          handleRecursiveSelection(selectedText, currentPopup.getRect());
        }
      );
    }
  } catch (error) {
    console.error('Error handling selection:', error);
    if (popupManager) {
      popupManager.showError('Failed to fetch definition');
    }
  } finally {
    isProcessing = false;
  }
}

/**
 * Handle clicks outside the popup to close it
 */
function handleDocumentClick(event: MouseEvent): void {
  if (!popupManager) {
    return;
  }

  const target = event.target as HTMLElement;
  if (!target.closest('#leveler-popup')) {
    popupManager.close();
    popupManager = null;
    explorationHistory.length = 0; // Reset history when closing
  }
}

/**
 * Initialize the content script
 */
function init(): void {
  console.log('Leveler extension loaded');

  // Listen for text selection (mouseup event)
  document.addEventListener('mouseup', (event) => {
    // Small delay to ensure selection is complete
    setTimeout(() => {
      handleTextSelection();
    }, 100);
  });

  // Listen for clicks to close popup
  document.addEventListener('click', handleDocumentClick);

  // Listen for escape key to close popup
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && popupManager) {
      popupManager.close();
      popupManager = null;
      explorationHistory.length = 0;
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
