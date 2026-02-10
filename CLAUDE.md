# Guidelines for Claude

## Commit Messages

Write commit messages as human-readable descriptions of what changed, not as change lists.

**Good:**
```
Add full document parsing to extract context around selected terms in PDFs

PDFs now parse on open using PDF.js in an offscreen document, enabling the extension to send ~2000 characters of surrounding text to the API for more accurate definitions of ambiguous legal terms like "state" or "brief".
```

**Bad:**
```
- Add offscreen document for PDF parsing
- Update service worker to manage offscreen documents
- Create pdf-context.ts for context extraction
- Modify content script to trigger parsing
- Update manifest.json with offscreen permission
```

The commit message should tell a story about what changed and why, focusing on the user-facing impact or technical improvement, not a list of files modified.

## Project Context

**Target Users**: Lawyers reading legal documents (PDFs and HTML)
**Core Value**: Instant, context-aware definitions with recursive exploration
**Critical Constraint**: Chrome's native PDF viewer is sandboxed from DOM APIs

## Key Technical Patterns

- Use offscreen documents for operations requiring DOM/window APIs
- Service workers handle background tasks and message routing
- Content scripts manage UI and user interactions
- Always test with real legal PDFs containing ambiguous terms
