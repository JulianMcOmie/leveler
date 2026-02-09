const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Clean dist folder
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true });
}
fs.mkdirSync('dist', { recursive: true });

// Bundle content script
esbuild.build({
  entryPoints: ['content/content-script.ts'],
  bundle: true,
  outfile: 'dist/content/content-script.js',
  format: 'iife', // Immediately Invoked Function Expression - works in content scripts
  platform: 'browser',
  target: 'es2020',
}).then(() => {
  console.log('✓ Content script bundled');

  // Copy manifest
  fs.copyFileSync('manifest.json', 'dist/manifest.json');
  console.log('✓ Manifest copied');

  // Copy styles
  fs.mkdirSync('dist/content', { recursive: true });
  fs.copyFileSync('content/styles.css', 'dist/content/styles.css');
  console.log('✓ Styles copied');

  // Copy assets
  if (fs.existsSync('assets')) {
    fs.cpSync('assets', 'dist/assets', { recursive: true });
    console.log('✓ Assets copied');
  }

  console.log('\n✅ Build complete! Load dist/ folder in Chrome.\n');
}).catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});
