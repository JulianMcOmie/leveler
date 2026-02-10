import { getSelection, getSelectionRect } from './selection-handler';
import { fetchDefinition } from '../shared/api-client';
import { PopupManager } from './popup-manager';
import { HistoryItem } from '../shared/types';

// Global state
let popupManager: PopupManager | null = null;
let isProcessing = false;
let isNavigating = false; // Prevent overlapping navigation
const explorationHistory: HistoryItem[] = [];

// Track mouse position for popup placement
let lastMousePosition = { x: 0, y: 0 };
let pdfSelectionPosition: { x: number; y: number } | null = null;

// Track mouse position globally
document.addEventListener('mousemove', (e) => {
  lastMousePosition = { x: e.clientX, y: e.clientY };
});


/**
 * Handle back button click - navigate to previous item in history
 */
function handleBackNavigation(): void {
  if (isNavigating) {
    console.log('Already navigating, ignoring...');
    return;
  }

  isNavigating = true;
  console.log('handleBackNavigation called, history length:', explorationHistory.length);
  console.log('History contents:', explorationHistory.map(h => h.term));

  if (explorationHistory.length === 0) {
    console.log('No history to go back to');
    isNavigating = false;
    return;
  }

  // Pop the previous item from history BEFORE closing (closing triggers onClose which clears history!)
  const previousItem = explorationHistory.pop()!;
  console.log('Popped from history:', previousItem.term, 'Remaining history:', explorationHistory.length);

  // Clear any active text selection to prevent triggering new selection events
  const selection = window.getSelection();
  if (selection) {
    selection.removeAllRanges();
  }

  // Get current popup position before closing
  const rect = popupManager ? popupManager.getRect() : { top: 100, left: 100, width: 0, height: 0 } as DOMRect;

  // Close current popup WITHOUT triggering onClose (which would clear history)
  // We're navigating, not actually closing the extension
  if (popupManager) {
    // Remove the container without calling the onClose callback
    const container = document.getElementById('leveler-popup');
    if (container) {
      container.remove();
    }
    // Clear the reference to prevent event handler conflicts
    popupManager = null;
  }

  // Create new popup with previous definition (INSTANTLY - no API call)
  const newPopup = new PopupManager();
  const stillHasHistory = explorationHistory.length > 0;

  // Show popup with term immediately (no loading state needed - we have the definition cached)
  newPopup.show(rect, '', true, previousItem.term, stillHasHistory);

  // Immediately show the stored definition (no API call)
  newPopup.showDefinition(
    previousItem.definition,
    previousItem.term,
    stillHasHistory,
    () => {
      // On close, clear history
      explorationHistory.length = 0;
    },
    (nextSelectedText: string) => {
      // On word selection, go deeper
      explorationHistory.push({
        term: previousItem.term,
        definition: previousItem.definition,
        context: previousItem.context,
      });
      handleRecursiveSelection(nextSelectedText, newPopup.getRect());
    },
    () => {
      // On back button, recurse
      handleBackNavigation();
    }
  );

  popupManager = newPopup;
  isNavigating = false;
}

/**
 * Handle text selection from context menu (right-click)
 */
async function handleContextMenuSelection(selectedText: string, context: string): Promise<void> {
  console.log('handleContextMenuSelection called:', selectedText);
  console.log('pdfSelectionPosition:', pdfSelectionPosition);
  console.log('lastMousePosition:', lastMousePosition);
  console.log('window.scrollY:', window.scrollY, 'window.scrollX:', window.scrollX);
  console.log('window.innerHeight:', window.innerHeight, 'window.innerWidth:', window.innerWidth);

  if (isProcessing) return;
  isProcessing = true;

  try {
    // Close existing popup if any
    if (popupManager) {
      popupManager.close();
    }

    // For PDFs, use a fixed position since we can't reliably capture selection position
    // Chrome's PDF viewer is sandboxed and events don't propagate correctly
    // Position at top-center of viewport for consistent, visible placement
    const viewportCenterX = window.innerWidth / 2;
    const topY = 60; // 60px from top

    console.log('Using fixed top-center position for PDF popup');
    console.log('Viewport size:', { width: window.innerWidth, height: window.innerHeight });
    console.log('Popup position:', { x: viewportCenterX, y: topY });

    // Create a rect at top-center of viewport
    const SELECTION_HEIGHT = 20;
    const viewportRect: DOMRect = {
      top: topY - SELECTION_HEIGHT / 2,
      bottom: topY + SELECTION_HEIGHT / 2,
      left: viewportCenterX,
      right: viewportCenterX,
      width: 0,
      height: SELECTION_HEIGHT,
      x: viewportCenterX,
      y: topY - SELECTION_HEIGHT / 2,
      toJSON: () => ({})
    } as DOMRect;

    // Create new popup manager
    popupManager = new PopupManager();
    popupManager.show(viewportRect, 'Loading...', false, selectedText, false);

    // Note: Don't clear pdfSelectionPosition here - we might need it again
    // It will be overwritten on the next selection anyway

    // Fetch definition from API
    const usedTerms = explorationHistory.map(item => item.term);
    const response = await fetchDefinition({
      selectedText: selectedText,
      context: context,
      history: usedTerms,
    });

    if (response.error) {
      popupManager.showError(response.error);
    } else {
      const currentPopup = popupManager;
      popupManager.showDefinition(
        response.definition,
        selectedText,
        false, // No back button for initial selection
        () => {
          // On close
          explorationHistory.length = 0;
        },
        (nextSelectedText: string) => {
          // On word selection (recursive exploration)
          explorationHistory.push({
            term: selectedText,
            definition: response.definition,
            context: context,
          });
          handleRecursiveSelection(nextSelectedText, currentPopup.getRect());
        }
      );
    }
  } catch (error) {
    console.error('Error handling context menu selection:', error);
    if (popupManager) {
      popupManager.showError('Failed to fetch definition');
    }
  } finally {
    isProcessing = false;
  }
}

/**
 * Handle recursive selection within a popup
 */
async function handleRecursiveSelection(selectedText: string, popupRect: DOMRect): Promise<void> {
  if (isProcessing) {
    return;
  }

  isProcessing = true;

  try {
    // Close existing popup WITHOUT triggering onClose (which would clear history)
    if (popupManager) {
      const container = document.getElementById('leveler-popup');
      if (container) {
        container.remove();
      }
    }

    // Create new popup manager
    popupManager = new PopupManager();
    // For recursive selections, always show back button (we're at depth >= 1)
    const showBack = true;
    popupManager.show(popupRect, 'Loading...', true, selectedText, showBack); // Show term and back button immediately

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
      // For recursive selections, always show back button
      const showBack = true;

      popupManager.showDefinition(
        response.definition,
        selectedText, // Current term
        showBack, // Show back button (we're at depth >= 1)
        () => {
          // Callback when popup is closed (X button or click outside)
          console.log('onClose in handleRecursiveSelection - clearing history');
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
          // Back button callback - go back one level
          handleBackNavigation();
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
  console.log('handleTextSelection called');

  // Avoid handling selections within our own popup
  const target = document.activeElement;
  if (target && target.closest('#leveler-popup')) {
    console.log('Ignoring - selection is in our popup');
    return;
  }

  const selectionData = getSelection();
  console.log('Selection data:', selectionData);
  if (!selectionData || isProcessing) {
    console.log('No selection data or already processing');
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
    const usedTerms = explorationHistory.map(item => item.term);
    const response = await fetchDefinition({
      selectedText: selectionData.selectedText,
      context: selectionData.context,
      history: usedTerms,
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
          // Callback when word is selected within popup for recursive exploration
          // Add current item to history so we can go back to it
          explorationHistory.push({
            term: selectionData.selectedText,
            definition: response.definition,
            context: selectionData.context,
          });
          console.log('Added to history from initial selection:', selectionData.selectedText, 'History length:', explorationHistory.length);

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
 * Handle messages from service worker (context menu)
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Message received in frame:', {
    url: window.location.href,
    isPDF: document.contentType === 'application/pdf',
    action: message.action
  });

  if (message.action === 'showDefinition') {
    // Only respond if we're in the PDF frame (not about:blank)
    const isPDF = document.contentType === 'application/pdf';
    if (!isPDF && window.location.href === 'about:blank') {
      console.log('⏭️  Ignoring message in about:blank frame');
      return true;
    }

    handleContextMenuSelection(message.selectedText, message.context);
    sendResponse({ success: true });
  }
  return true; // Keep channel open for async response
});

/**
 * Close the current popup and reset state
 */
function closePopup(): void {
  if (popupManager) {
    popupManager.close();
    popupManager = null;
    explorationHistory.length = 0;
    isNavigating = false;
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
  // Check if click is on close button
  if (target.classList.contains('close-button') || target.closest('.close-button')) {
    closePopup();
    return;
  }

  // Check if click is outside popup
  if (!target.closest('#leveler-popup')) {
    closePopup();
  }
}

/**
 * Initialize the content script
 */
function init(): void {
  console.log('Leveler extension loaded');
  console.log('Document type:', document.contentType);
  console.log('URL:', window.location.href);

  const isPDF = document.contentType === 'application/pdf';
  console.log('Is PDF:', isPDF);

  if (isPDF) {
    console.log('📄 PDF detected in frame:', window.location.href);
    console.log('💡 To define terms: Select text → Right-click → "Define with Leveler"');

    // Capture position when user right-clicks (opens context menu)
    document.addEventListener('contextmenu', (e) => {
      pdfSelectionPosition = { x: e.clientX, y: e.clientY };
      console.log('🎯 Right-click detected at:', pdfSelectionPosition, 'in frame:', window.location.href);
    }, true); // Use capture phase to ensure we get it
  } else {
    // For regular pages, use mouseup event (fires when selection is complete)
    document.addEventListener('mouseup', () => {
      console.log('Mouseup event detected');
      setTimeout(() => {
        handleTextSelection();
      }, 100);
    });
  }

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
