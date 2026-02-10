// Service worker for context menu support

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
