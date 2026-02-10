/**
 * Offscreen document for PDF parsing
 * Has access to DOM/window, can use PDF.js
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('pdf.worker.js');

console.log('📄 Offscreen PDF parser loaded');

// Listen for parse requests from service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'parsePDF') {
    console.log('📨 Offscreen received PDF parse request:', message.pdfUrl);

    parsePDF(message.pdfUrl)
      .then(result => {
        console.log('✅ Offscreen parse complete:', result.pageCount, 'pages');
        sendResponse(result);
      })
      .catch(error => {
        console.error('❌ Offscreen parse error:', error);
        sendResponse({
          success: false,
          error: error.message || 'Unknown error'
        });
      });

    return true; // Async response
  }
});

/**
 * Parse PDF and extract all text
 */
async function parsePDF(pdfUrl: string) {
  try {
    console.log('📄 Loading PDF:', pdfUrl);

    // Load PDF
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;

    console.log(`📄 PDF loaded: ${pdf.numPages} pages`);

    let allText = '';

    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');

      allText += pageText + '\n\n';

      if (pageNum % 10 === 0) {
        console.log(`📄 Extracted ${pageNum}/${pdf.numPages} pages...`);
      }
    }

    console.log(`✅ Extraction complete: ${allText.length} characters`);

    return {
      success: true,
      text: allText,
      pageCount: pdf.numPages
    };
  } catch (error: any) {
    console.error('❌ Error parsing PDF:', error);
    throw error;
  }
}
