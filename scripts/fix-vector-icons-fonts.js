const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'node_modules', 'react-native-vector-icons', 'Fonts');
const targetDir = path.join(__dirname, '..', 'node_modules', '@expo', 'vector-icons', 'build', 'vendor', 'react-native-vector-icons', 'Fonts');

if (!fs.existsSync(sourceDir)) {
  console.warn('[fix-vector-icons-fonts] source missing:', sourceDir);
  process.exit(0);
}

fs.mkdirSync(targetDir, { recursive: true });

for (const file of fs.readdirSync(sourceDir)) {
  if (!file.endsWith('.ttf')) {
    continue;
  }

  fs.copyFileSync(path.join(sourceDir, file), path.join(targetDir, file));
}

console.log('[fix-vector-icons-fonts] fonts synced to @expo/vector-icons vendor dir');
