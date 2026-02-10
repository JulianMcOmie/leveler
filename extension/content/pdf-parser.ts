/**
 * PDF parsing module that requests parsing from background worker
 * Background worker has permissions to access file:// URLs
 */

export interface PDFTextCache {
  url: string;
  text: string;
  pageCount: number;
  extractedAt: number;
}

let currentPDFCache: PDFTextCache | null = null;

/**
 * Parse and cache PDF text by requesting from background worker
 */
export async function parsePDFOnOpen(pdfUrl: string): Promise<PDFTextCache> {
  // Check if already cached
  if (currentPDFCache && currentPDFCache.url === pdfUrl) {
    console.log('✅ Using cached PDF text');
    return currentPDFCache;
  }

  console.log('🔄 Requesting PDF parse from background worker...');

  // Request parsing from background worker (has file:// access)
  const response = await chrome.runtime.sendMessage({
    action: 'parsePDF',
    pdfUrl: pdfUrl
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to parse PDF');
  }

  // Cache the result
  currentPDFCache = {
    url: pdfUrl,
    text: response.text,
    pageCount: response.pageCount,
    extractedAt: Date.now(),
  };

  console.log(`✅ PDF parsed: ${response.text.length} characters, ${response.pageCount} pages`);

  return currentPDFCache;
}

/**
 * Get context around selected text from cached PDF
 */
export function getContextFromPDF(selectedText: string, contextSize: number = 2000): string {
  if (!currentPDFCache) {
    console.warn('⚠️ No PDF text cached, using selected text as context');
    return selectedText;
  }

  const text = currentPDFCache.text;
  const index = text.indexOf(selectedText);

  if (index === -1) {
    console.warn('⚠️ Selected text not found in PDF, using full text as context');
    // Return first N characters as context
    return text.substring(0, contextSize * 2);
  }

  // Extract context around the selected text
  const start = Math.max(0, index - contextSize);
  const end = Math.min(text.length, index + selectedText.length + contextSize);

  const context = text.substring(start, end);

  console.log(`✅ Extracted context: ${context.length} characters around "${selectedText.substring(0, 20)}..."`);

  return context;
}

/**
 * Get cached PDF text
 */
export function getCachedPDFText(): string | null {
  return currentPDFCache?.text || null;
}

/**
 * Clear PDF cache
 */
export function clearPDFCache(): void {
  currentPDFCache = null;
  console.log('🗑️ PDF cache cleared');
}
