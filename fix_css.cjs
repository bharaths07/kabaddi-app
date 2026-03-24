const fs = require('fs');

const files = [
  'e:/kabaddi-app/src/features/kabaddi/pages/leaderboards.css',
  'e:/kabaddi-app/src/features/kabaddi/components/scorers/KabaddiLiveScorer.css'
];

const propsToFix = [
  'fontWeight', 'maxWidth', 'textAlign', 'alignItems', 'justifyContent',
  'fontSize', 'zIndex', 'whiteSpace', 'borderRadius', 'marginBottom'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  propsToFix.forEach(prop => {
    const kebabCase = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
    const regex = new RegExp(prop + '\\s*:', 'g');
    content = content.replace(regex, kebabCase + ':');
  });
  fs.writeFileSync(f, content);
  console.log('Fixed:', f);
});
