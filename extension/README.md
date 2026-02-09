# Leveler Chrome Extension

A domain-agnostic Chrome extension that provides instant, context-aware definitions for technical terms.

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Build the extension:
```bash
npm run build
```

3. Load in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `dist/` folder

4. Development workflow:
   - Run `npm run watch` to auto-rebuild on changes
   - After changes, click the refresh icon on the extension card in `chrome://extensions/`

## Project Structure

```
extension/
├── manifest.json          # Extension configuration
├── content/
│   ├── content-script.ts # Main content script (injected into pages)
│   ├── selection-handler.ts # Text selection logic
│   ├── popup-manager.ts  # Floating popup UI
│   └── styles.css        # Popup styles (Shadow DOM)
├── shared/
│   ├── api-client.ts     # API calls to leveler.dev/api/chat
│   ├── types.ts          # TypeScript interfaces
│   └── utils.ts          # Token parsing utilities
└── assets/
    └── icons/            # Extension icons
```

## Key Features

- **Text Selection**: Highlight any term on any webpage to see a definition
- **Context-Aware**: Definitions consider the surrounding sentence for accuracy
- **Recursive Exploration**: Click words within definitions to dig deeper
- **Zero Configuration**: Works immediately after installation
- **Domain-Agnostic**: Works for legal, medical, academic, technical content
