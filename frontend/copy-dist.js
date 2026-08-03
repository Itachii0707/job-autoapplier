const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'out');
const dest = path.join(__dirname, 'dist');

try {
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true, force: true });
    console.log('✅ Successfully copied Next.js exported build from out/ to dist/');
  } else {
    console.warn('⚠️ Source directory out/ does not exist.');
  }
} catch (e) {
  console.error('Error copying out to dist:', e);
}
