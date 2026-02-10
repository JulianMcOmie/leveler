// Service worker for context menu support and offscreen document management

let offscreenDocumentCreated = false;

// Create context menu on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'leveler-define',
    title: 'Define with Leveler',
    contexts: ['selection'],
  });
  console.log('Leveler context menu created');
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'leveler-define' && tab?.id) {
    const selectedText = info.selectionText?.trim();

    if (!selectedText) {
      console.log('No text selected');
      return;
    }

    // Send message to content script to show definition popup
    chrome.tabs.sendMessage(tab.id, {
      action: 'showDefinition',
      selectedText: selectedText,
      context: selectedText, // Use selected text as context
    }).catch((error) => {
      console.error('Error sending message to content script:', error);
    });
  }
});

/**
 * Create offscreen document for PDF parsing
 */
async function createOffscreenDocument() {
  if (offscreenDocumentCreated) {
    return;
  }

  try {
    await chrome.offscreen.createDocument({
      url: 'offscreen/offscreen.html',
      reasons: [chrome.offscreen.Reason.DOM_PARSER],
      justification: 'Parse PDF files to extract text for context-aware definitions'
    });
    offscreenDocumentCreated = true;
    console.log('✅ Offscreen document created');
  } catch (error) {
    console.error('❌ Error creating offscreen document:', error);
    throw error;
  }
}

/**
 * Handle PDF parse requests by routing to offscreen document
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'parsePDF') {
    console.log('📨 Service worker received parse request:', message.pdfUrl);

    // Create offscreen document if needed, then forward request
    createOffscreenDocument()
      .then(() => {
        // Forward request to offscreen document
        return chrome.runtime.sendMessage({
          action: 'parsePDF',
          pdfUrl: message.pdfUrl
        });
      })
      .then(result => {
        console.log('✅ Service worker got result from offscreen');
        sendResponse(result);
      })
      .catch(error => {
        console.error('❌ Service worker error:', error);
        sendResponse({
          success: false,
          error: error.message || 'Unknown error'
        });
      });

    return true; // Async response
  }
});

console.log('🔧 Leveler service worker loaded');
