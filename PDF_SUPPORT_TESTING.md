# PDF Support Testing Guide

## What Changed (v0.2.0)

### New Features
- ✅ **PDF Support**: The extension now works on PDFs using Chrome's context menu API
- ✅ **Auto-show Context Menu**: In PDFs, the context menu automatically appears when you select text
- ✅ **Smart Popup Positioning**: Popup appears near your cursor location (similar to Mac's lookup feature)
- ✅ **Service Worker**: Added background service worker to handle context menu clicks

### How It Works

**HTML Pages (unchanged):**
- Select text → popup appears automatically (0 clicks)

**PDF Files (new):**
1. Select text → context menu automatically shows
2. Click "Define with Leveler" → popup appears with definition near cursor (1 click)
3. Can still explore recursively by selecting words in the popup

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select `/Users/julianmcomie/leveler/extension/dist` folder
5. Verify version shows **0.2.0**

## Testing Procedure

### Test 1: HTML Pages (Verify Unchanged Behavior)
1. Open `extension/lawsample.html`
2. Select any legal term (e.g., "consideration", "tort")
3. ✅ Popup should appear automatically
4. Select a word in the popup definition
5. ✅ Should navigate to that word's definition (back button appears)
6. Click back button
7. ✅ Should return to previous definition
8. Click X or press Escape or click outside
9. ✅ Popup should close

### Test 2: PDF Files (New Feature)
1. Open any PDF in Chrome (e.g., a legal document)
2. Select any text
3. ✅ Context menu should **automatically appear**
4. ✅ Verify "Define with Leveler" appears in the menu
5. Click "Define with Leveler"
6. ✅ Popup should appear near your cursor with the definition
7. Select a word in the popup
8. ✅ Should navigate to that word's definition
9. Test back button, close, etc.

### Test 3: Edge Cases
- ✅ Switch between HTML and PDF tabs (should work on both)
- ✅ Select very long text (>100 characters)
- ✅ Restart browser and test again (context menu should persist)
- ✅ Reload extension and test (context menu should recreate)
- ✅ Test on multi-column PDFs
- ✅ Test popup positioning (should appear near cursor, not off-screen)

## Debugging

### Console Logs to Check

**In HTML pages:**
```
Leveler extension loaded
Document type: text/html
Is PDF: false
Mouseup event detected
```

**In PDF files:**
```
Leveler extension loaded
Document type: application/pdf
Is PDF: true
PDF detected - context menu will auto-show when you select text
Text selection detected, showing context menu
```

**In service worker console (chrome://extensions/ → Service Worker → inspect):**
```
Leveler context menu created
```

### Common Issues

**Context menu doesn't appear:**
- Check service worker console for errors
- Verify extension reloaded after build
- Try right-clicking manually (context menu should still work)

**Popup doesn't appear after clicking menu item:**
- Check page console for errors
- Verify content script loaded (look for "Leveler extension loaded" log)
- Check if message is being received

**Popup appears in wrong location:**
- This is expected - using last mouse position
- Should be near where you interacted

## Technical Details

### Files Modified
- **NEW**: `extension/background/service-worker.ts` (context menu handler)
- **MODIFIED**: `extension/content/content-script.ts` (message listener, PDF detection, mouse tracking)
- **MODIFIED**: `extension/manifest.json` (contextMenus permission, background service worker)
- **MODIFIED**: `extension/build.js` (bundle service worker)

### Code Changes Summary
- Added mouse position tracking for smart popup placement
- Added message listener for service worker communication
- Added `handleContextMenuSelection` function for context menu flow
- Removed PDF polling code (lines 308-347)
- Added auto-show context menu logic for PDFs
- Added service worker for context menu registration

### Why This Approach?

**Technical Limitation**: Chrome's native PDF viewer doesn't expose text selection through normal DOM APIs. The ONLY way to get selected text is through `chrome.contextMenus.onClicked` which provides `info.selectionText`.

**UX Trade-off**: This requires 1 click (the menu item) vs 0 clicks on HTML pages, but it's the **best possible with Chrome's native PDF viewer** without building a custom PDF renderer (4-6 weeks of work).

**Auto-show Feature**: We automatically show the context menu when text is selected, so users don't need to right-click manually - they just need to click the menu item.

## Next Steps

1. ✅ Test on HTML pages (verify nothing broke)
2. ✅ Test on simple PDFs
3. ✅ Test on complex legal PDFs (multi-column, complex formatting)
4. ✅ Get feedback from target user (mom/lawyer)
5. ⚠️ If 1-click is acceptable → ship it
6. ⚠️ If 1-click is too slow → consider custom PDF.js viewer (4-6 weeks)

## Success Criteria

- ✅ Context menu appears when text selected in PDFs
- ✅ Clicking menu item shows definition popup
- ✅ Popup positioned near cursor (not off-screen)
- ✅ Recursive exploration works in popup
- ✅ Works on real legal PDFs
- ✅ No console errors
- ✅ HTML pages still work automatically
- ✅ Target users (lawyers) can use it daily

## Known Limitations

1. **Requires 1 click in PDFs**: Cannot be reduced further with Chrome's native PDF viewer
2. **Different UX**: PDFs use context menu, HTML uses automatic popup
3. **Context menu shows for all selections**: Even when not selecting technical terms
4. **No keyboard shortcut**: Must use mouse to interact with context menu

## Future Enhancements (Optional)

1. **Hybrid Approach** (2-3 days): Detect PDF.js-based viewers, enable automatic selection there
2. **Custom PDF.js Viewer** (4-6 weeks): Build custom PDF renderer for full control
3. **Advanced Context Menu** (1 day): Add recent terms submenu, keyboard shortcuts
4. **Onboarding Tooltip** (4 hours): Show one-time message on first PDF visit
