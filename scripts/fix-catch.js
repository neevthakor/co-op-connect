const fs = require('fs');
const path = require('path');

function replaceCatchBlocks(file) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  content = content.replace(/catch\s*\(\s*(\w+)\s*:\s*any\s*\)/g, 'catch ($1)');
  
  content = content.replace(/\berror\.message\b/g, (match) => {
    return '(error instanceof Error ? error.message : "Unknown error")';
  });
  content = content.replace(/\be\.message\b/g, (match) => {
    return '(err instanceof Error ? err.message : "Unknown error")';
  });
  content = content.replace(/\(\(err(?:or)? instanceof Error \? err(?:or)?\.message : "Unknown error"\) instanceof Error \? \(err(?:or)? instanceof Error \? err(?:or)?\.message : "Unknown error"\) : "Unknown error"\)/g, 
    match => match.includes('err.') ? '(err instanceof Error ? err.message : "Unknown error")' : '(error instanceof Error ? error.message : "Unknown error")');
  content = content.replace(/err(?:or)? instanceof Error \? \(err(?:or)? instanceof Error \? err(?:or)?\.message : "Unknown error"\)/g,
    match => match.includes('err ') ? 'err instanceof Error ? err.message' : 'error instanceof Error ? error.message');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
  }
}

function processAllFiles(dir) {
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (!['node_modules', '.next', '.git'].includes(f)) {
        processAllFiles(full);
      }
    } else if (full.endsWith('.ts') || full.endsWith('.tsx')) {
      replaceCatchBlocks(full);
    }
  });
}

processAllFiles('src');
console.log('Catch blocks fixed');
