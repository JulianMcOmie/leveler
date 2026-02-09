# Leveler

A tool for understanding technical terms through recursive exploration. Available as both a web app and Chrome extension.

## Projects

### 1. Web App (`/app`)
Interactive web interface for exploring technical concepts recursively. Users type a term, get a concise 10-word definition, then click words within the definition to explore deeper.

**Live:** https://leveler.dev

### 2. Chrome Extension (`/extension`)
Browser extension that provides instant, context-aware definitions for any text you highlight on any webpage. Supports recursive exploration by selecting words within the popup.

**Status:** MVP complete, in testing

## Features

**Web App:**
- Clean, centered input for exploring terms
- Recursive word-by-word exploration
- Context-aware definitions powered by Gemini 2.5-Flash
- Beautiful gradient UI with smooth animations

**Chrome Extension:**
- Highlight any term on any webpage to see definition
- Floating popup with context-aware explanations
- Recursive exploration within popup
- Shadow DOM for style isolation
- Works on legal docs, technical docs, medical content, etc.

## Quick Start

### Web App Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:3000
```

### Chrome Extension Development

```bash
# Navigate to extension folder
cd extension

# Install dependencies
npm install

# Build extension
npm run build

# Load extension in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select extension/dist/ folder
```

See [`extension/README.md`](extension/README.md) for detailed extension documentation.

## API

Both projects share the same API endpoint:

**Endpoint:** `POST /api/chat`

**Request:**
```json
{
  "message": "term to define",
  "immediateContext": "The sentence containing the term",
  "depth": 0,
  "usedTerms": []
}
```

**Response:**
```json
{
  "response": "Concise 10-word definition"
}
```

**CORS:** Enabled for Chrome extension support
**Rate Limiting:** 100 requests per IP per 24 hours

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **AI:** Google Gemini 2.5-Flash API
- **Styling:** CSS Modules
- **Extension:** Chrome Manifest V3, esbuild bundler
- **Deployment:** Vercel

## Project Structure

```
leveler/
├── app/                    # Next.js web app
│   ├── api/chat/          # Shared API endpoint
│   ├── page.tsx           # Main web interface
│   └── page.module.css    # Styles
├── extension/             # Chrome extension
│   ├── content/           # Content scripts
│   ├── shared/            # Shared utilities
│   ├── build.js           # Build script
│   └── README.md          # Extension docs
├── .gitignore
└── README.md              # This file
```

## Development Workflow

### Making API Changes

When updating the API, both projects are affected:

```bash
# 1. Update app/api/chat/route.ts
# 2. Test with web app (npm run dev)
# 3. Test with extension (load in Chrome)
# 4. Commit and push (triggers Vercel deployment)
git add app/api/chat/route.ts
git commit -m "Update API"
git push
```

### Making Extension Changes

```bash
cd extension
# Edit TypeScript files
npm run build
# Reload extension in chrome://extensions/
```

### Making Web App Changes

```bash
# Edit files in app/
npm run dev
# See changes at localhost:3000
```

## Environment Variables

Create `.env.local` in the root directory:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

## Deployment

**Web App:** Automatically deployed to Vercel on push to `main`

**Extension:**
- MVP: Manually distributed (load unpacked)
- Future: Chrome Web Store submission

## Testing

**Web App:**
```bash
npm run build
npm start
```

**Extension:**
See [`extension/INSTALLATION.md`](extension/INSTALLATION.md) for comprehensive testing checklist.

## Contributing

This is currently a personal project in MVP/validation phase. Feedback welcome!

## License

© 2025 Julian McOmie. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

**Note:** This license supersedes any prior license notices that may appear in the git history. The software has never been released under an open source license.
