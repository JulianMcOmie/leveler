const esbuild = require('esbuild');
const fs = require('fs');

// Clean dist folder
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true });
}
fs.mkdirSync('dist', { recursive: true });

// Bundle content script
const contentScriptPromise = esbuild.build({
  entryPoints: ['content/content-script.ts'],
  bundle: true,
  outfile: 'dist/content/content-script.js',
  format: 'iife',
  platform: 'browser',
  target: 'es2020',
});

// Bundle service worker
const serviceWorkerPromise = esbuild.build({
  entryPoints: ['background/service-worker.ts'],
  bundle: true,
  outfile: 'dist/background/service-worker.js',
  format: 'esm', // ES modules for service workers
  platform: 'browser',
  target: 'es2020',
});

// Bundle offscreen document
const offscreenPromise = esbuild.build({
  entryPoints: ['offscreen/offscreen.ts'],
  bundle: true,
  outfile: 'dist/offscreen/offscreen.js',
  format: 'iife',
  platform: 'browser',
  target: 'es2020',
});

// Wait for all builds
Promise.all([contentScriptPromise, serviceWorkerPromise, offscreenPromise])
  .then(() => {
    console.log('✓ Content script bundled');
    console.log('✓ Service worker bundled');
    console.log('✓ Offscreen document bundled');

    // Copy manifest
    fs.copyFileSync('manifest.json', 'dist/manifest.json');
    console.log('✓ Manifest copied');

    // Copy offscreen HTML
    fs.mkdirSync('dist/offscreen', { recursive: true });
    fs.copyFileSync('offscreen/offscreen.html', 'dist/offscreen/offscreen.html');
    console.log('✓ Offscreen HTML copied');

    // Copy PDF.js worker
    const pdfWorkerSrc = 'node_modules/pdfjs-dist/build/pdf.worker.mjs';
    const pdfWorkerDest = 'dist/pdf.worker.js';
    if (fs.existsSync(pdfWorkerSrc)) {
      fs.copyFileSync(pdfWorkerSrc, pdfWorkerDest);
      console.log('✓ PDF.js worker copied');
    } else {
      console.warn('⚠️  PDF.js worker not found');
    }

    // Copy styles
    fs.mkdirSync('dist/content', { recursive: true});
    fs.copyFileSync('content/styles.css', 'dist/content/styles.css');
    console.log('✓ Styles copied');

    // Copy assets (if exists)
    if (fs.existsSync('assets')) {
      fs.cpSync('assets', 'dist/assets', { recursive: true });
      console.log('✓ Assets copied');
    }

    console.log('\n✅ Build complete! Load dist/ folder in Chrome.\n');
  })
  .catch((error) => {
    console.error('Build failed:', error);
    process.exit(1);
  });
