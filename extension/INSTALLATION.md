# Leveler Extension - Installation & Testing Guide

## Installation Steps

### 1. Build the Extension

```bash
cd extension
npm install
npm run build
```

This will create a `dist/` folder with the compiled extension.

### 2. Load in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **"Developer mode"** in the top right corner
3. Click **"Load unpacked"**
4. Select the `extension/dist/` folder

You should now see the Leveler extension card appear in your extensions list.

### 3. Verify Installation

- The extension should show as "Enabled"
- No errors should appear in the extension card
- You can click "Inspect views: service worker" to see console logs (if needed)

## Quick Test

1. Open the included `test.html` file in Chrome (or any webpage with technical text)
2. Highlight any technical term (e.g., "estoppel", "asynchronous", "dyspnea")
3. A popup should appear within 1-2 seconds with a concise definition
4. Try highlighting a word within the popup for recursive exploration
5. Click the X button or outside the popup to close it

## Testing Checklist

### Core Functionality

- [ ] Highlight single word → popup appears with definition
- [ ] Highlight multi-word phrase (2-5 words) → popup appears with contextual definition
- [ ] Popup appears within 2 seconds of selection
- [ ] Definition is concise (approximately 10 words)
- [ ] Definition is contextually relevant to the sentence

### Recursive Exploration

- [ ] Click and drag within popup → can select individual words
- [ ] Selected words in popup are highlighted (green background, white text)
- [ ] Mouse up on selected words → new definition appears
- [ ] Can explore 3-5 levels deep
- [ ] Previously explored terms are tracked (prevents circular definitions)

### UI/UX

- [ ] Popup positions above selection when near bottom of viewport
- [ ] Popup positions below selection when near top of viewport
- [ ] Popup stays fully visible (doesn't go off-screen)
- [ ] Close button (X) works
- [ ] Clicking outside popup closes it
- [ ] Pressing Escape key closes popup
- [ ] Only one popup visible at a time (new selection closes previous)

### Error Handling

- [ ] API errors show user-friendly error message
- [ ] Rate limit errors display clearly
- [ ] Very short selections (<2 chars) are ignored
- [ ] Very long selections (>100 chars) are ignored
- [ ] Invalid selections (no text) are handled gracefully

### Cross-Site Compatibility

Test on diverse websites:

- [ ] Wikipedia article (e.g., legal topics, medical topics)
- [ ] PDF opened in Chrome (legal contract, research paper)
- [ ] Medium article or blog post
- [ ] GitHub README or documentation
- [ ] Technical documentation site (e.g., MDN, React docs)
- [ ] News article
- [ ] Google Docs (may not work due to CSP - note as known limitation)

### Performance

- [ ] Extension doesn't slow down page loading
- [ ] Popup appears quickly (<2 seconds typical)
- [ ] No memory leaks (test with multiple selections)
- [ ] No console errors on normal usage

## Troubleshooting

### Extension Doesn't Load

- Check that you selected the `dist/` folder, not the `extension/` folder
- Verify there are no errors in the extension card
- Try clicking "Reload" on the extension card
- Check browser console for errors

### Popup Doesn't Appear

- Check that you highlighted text (selection must be >2 characters)
- Verify the extension is enabled in `chrome://extensions/`
- Open DevTools (F12) and check Console for errors
- Check Network tab to see if API call is being made to leveler.dev

### API Errors

- Verify leveler.dev is accessible (visit https://leveler.dev in browser)
- Check if CORS is enabled on the API (should show in Network tab)
- Verify rate limit hasn't been hit (100 requests per day per IP)
- Check that `.env.local` has valid `GEMINI_API_KEY` on server

### Popup Position Issues

- Test on different screen sizes and viewport positions
- Verify popup doesn't go off-screen
- Report specific sites where positioning is broken

## Development Workflow

### Making Changes

1. Edit TypeScript files in `extension/content/` or `extension/shared/`
2. Run `npm run build` to recompile
3. Go to `chrome://extensions/` and click "Reload" on the extension card
4. Refresh the test page and try again

### Watch Mode (Auto-rebuild)

```bash
npm run watch
```

This will automatically rebuild when you save files. You still need to manually reload the extension in Chrome.

## Known Limitations (MVP)

- **Google Docs**: May not work due to Content Security Policy restrictions
- **Some corporate sites**: May block content script injection
- **Icons**: Using default Chrome icon (custom icons to be added later)
- **Rate limiting**: 100 definitions per day per IP address
- **API dependency**: Requires internet connection and leveler.dev to be online

## Next Steps After Testing

1. Test thoroughly using the checklist above
2. Note any bugs or UX issues
3. Test on real legal documents (contracts, case law) with mom
4. Collect feedback on definition quality and usefulness
5. Iterate based on feedback before broader distribution
