import { getSelection, getSelectionRect } from './selection-handler';
import { fetchDefinition } from '../shared/api-client';
import { PopupManager } from './popup-manager';

// Global state
let popupManager: PopupManager | null = null;
let isProcessing = false;
const explorationHistory: string[] = [];

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
    popupManager.show(popupRect, 'Loading...');

    // Fetch definition from API using the full exploration history
    const response = await fetchDefinition({
      selectedText: selectedText,
      context: selectedText, // For recursive lookups, use the word itself as context
      history: explorationHistory,
    });

    if (response.error) {
      popupManager.showError(response.error);
    } else {
      // Add current term to history
      if (!explorationHistory.includes(selectedText)) {
        explorationHistory.push(selectedText);
      }

      const currentPopup = popupManager;
      popupManager.showDefinition(
        response.definition,
        () => {
          // Callback when popup is closed
          explorationHistory.length = 0;
        },
        (nextSelectedText: string) => {
          // Recursive callback for deeper exploration
          handleRecursiveSelection(nextSelectedText, currentPopup.getRect());
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
    popupManager.show(selectionRect, 'Loading...');

    // Fetch definition from API
    const response = await fetchDefinition({
      selectedText: selectionData.selectedText,
      context: selectionData.context,
      history: explorationHistory,
    });

    if (response.error) {
      popupManager.showError(response.error);
    } else {
      // Add current term to history for nested exploration
      if (!explorationHistory.includes(selectionData.selectedText)) {
        explorationHistory.push(selectionData.selectedText);
      }

      const currentPopup = popupManager;
      popupManager.showDefinition(
        response.definition,
        () => {
          // Callback when popup is closed
          // Clear exploration history when closing
          explorationHistory.length = 0;
        },
        (selectedText: string) => {
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
