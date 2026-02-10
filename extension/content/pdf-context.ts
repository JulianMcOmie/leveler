/**
 * PDF context extraction - requests parsing from offscreen document via service worker
 */

interface PDFTextCache {
  url: string;
  text: string;
  pageCount: number;
}

let currentCache: PDFTextCache | null = null;

/**
 * Request PDF parsing from background (which uses offscreen document)
 */
export async function parsePDF(pdfUrl: string): Promise<PDFTextCache> {
  // Check cache
  if (currentCache && currentCache.url === pdfUrl) {
    console.log('✅ Using cached PDF text');
    return currentCache;
  }

  console.log('🔄 Requesting PDF parse...');

  // Request parsing
  const response = await chrome.runtime.sendMessage({
    action: 'parsePDF',
    pdfUrl: pdfUrl
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to parse PDF');
  }

  // Cache result
  currentCache = {
    url: pdfUrl,
    text: response.text,
    pageCount: response.pageCount
  };

  console.log(`✅ PDF cached: ${response.pageCount} pages, ${response.text.length} chars`);

  return currentCache;
}

/**
 * Get context around selected text from cached PDF
 */
export function getContextFromPDF(selectedText: string, contextSize: number = 2000): string {
  if (!currentCache) {
    console.warn('⚠️ No PDF cached, using selected text');
    return selectedText;
  }

  const text = currentCache.text;
  const index = text.indexOf(selectedText);

  if (index === -1) {
    console.warn('⚠️ Text not found in PDF, using first part as context');
    return text.substring(0, contextSize * 2);
  }

  // Extract context around selection
  const start = Math.max(0, index - contextSize);
  const end = Math.min(text.length, index + selectedText.length + contextSize);
  const context = text.substring(start, end);

  console.log(`✅ Extracted ${context.length} chars of context`);

  return context;
}

/**
 * Check if PDF is cached
 */
export function isPDFCached(): boolean {
  return currentCache !== null;
}

/**
 * Clear cache
 */
export function clearCache(): void {
  currentCache = null;
}
