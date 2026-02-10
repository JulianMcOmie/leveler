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

// Wait for both builds
Promise.all([contentScriptPromise, serviceWorkerPromise])
  .then(() => {
    console.log('✓ Content script bundled');
    console.log('✓ Service worker bundled');

    // Copy manifest
    fs.copyFileSync('manifest.json', 'dist/manifest.json');
    console.log('✓ Manifest copied');

    // Copy styles
    fs.mkdirSync('dist/content', { recursive: true });
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
