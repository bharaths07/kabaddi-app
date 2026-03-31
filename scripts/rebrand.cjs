const fs = require('fs');
const path = require('path');

const TARGET_DIRS = ['src', 'public'];
const TARGET_FILES = ['index.html', 'package.json', 'README.md', 'manifest.json'];

function processFile(fullPath) {
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');
  let changed = false;
  
  const toReplace = [
    { find: /Play Legends Kabaddi/gi, replace: 'KabaddiPulse' },
    { find: /Play Legends/gi, replace: 'KabaddiPulse' },
    { find: /Kabaddi App/gi, replace: 'KabaddiPulse' },
    { find: /kabaddi-app/g, replace: 'kabaddipulse' }
  ];

  for (const {find, replace} of toReplace) {
    if (content.match(find)) {
      content = content.replace(find, replace);
      changed = true;
    }
  }

  // Handle specific title case for document.title
  if (content.includes('<title>kabaddipulse</title>')) {
     content = content.replace('<title>kabaddipulse</title>', '<title>KabaddiPulse</title>');
     changed = true;
  }

  if (changed) {
    fs.writeFileSync(fullPath, content);
    console.log('Updated: ' + fullPath);
  }
}

function replaceInDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.match(/\.(tsx|ts|html|json|css|md)$/)) {
      processFile(fullPath);
    }
  }
}

TARGET_DIRS.forEach(d => replaceInDir(path.join(__dirname, d)));
TARGET_FILES.forEach(f => processFile(path.join(__dirname, f)));
