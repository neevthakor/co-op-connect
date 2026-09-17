const fs = require('fs');
const path = require('path');

function processFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  let newContent = content.replace(/catch\s*\(\s*([a-zA-Z0-9_]+)\s*:\s*any\s*\)\s*\{\s*(?:\/\/\s*TODO:\s*type this properly)?/g, 'catch ($1) {');
  
  if (newContent !== content) {
    changed = true;
    content = newContent;
  }

  newContent = content.replace(/([a-zA-Z0-9_]+)\.message/g, (match, p1) => {
    if (['error', 'err', 'e'].includes(p1)) {
      return `(${p1} instanceof Error ? ${p1}.message : "Unknown error")`;
    }
    return match;
  });
  
  // Clean up double replacements if any
  newContent = newContent.replace(/\(\(([a-zA-Z0-9_]+) instanceof Error \? \1\.message \: "Unknown error"\) instanceof Error \? \1\.message \: "Unknown error"\)/g, `($1 instanceof Error ? $1.message : "Unknown error")`);
  newContent = newContent.replace(/\(\(([a-zA-Z0-9_]+) instanceof Error \? \1\.message \: 'Unknown error'\) instanceof Error \? \1\.message \: "Unknown error"\)/g, `($1 instanceof Error ? $1.message : "Unknown error")`);
  newContent = newContent.replace(/([a-zA-Z0-9_]+) instanceof Error \? \(\1 instanceof Error \? \1\.message \: "Unknown error"\)/g, `$1 instanceof Error ? $1.message`);

  if (newContent !== content) {
    changed = true;
    content = newContent;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
  }
}

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walk(dirPath);
    } else if (dirPath.endsWith('.ts') || dirPath.endsWith('.tsx')) {
      processFile(dirPath);
    }
  });
}

walk('src/app');
walk('src/services');
walk('src/components');
walk('scripts');
console.log('Processed');