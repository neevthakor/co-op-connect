const fs = require('fs');
const path = require('path');

// Patterns to fix across all .ts/.tsx files
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Fix catch blocks: catch (e: any) -> catch (e)
  content = content.replace(/catch\s*\(\s*(\w+)\s*:\s*any\s*\)/g, 'catch ($1)');

  // 2. Remove trailing // TODO: type this properly comments
  content = content.replace(/\s*\/\/\s*TODO:\s*type this properly\s*$/gm, '');

  // 3. Fix error.message usage in catch blocks to use instanceof check
  // Only if not already wrapped
  content = content.replace(/\berror\.message\b/g, (match) => {
    return '(error instanceof Error ? error.message : "Unknown error")';
  });
  // Fix double wrapping
  content = content.replace(/\(\(error instanceof Error \? error\.message : "Unknown error"\) instanceof Error \? \(error instanceof Error \? error\.message : "Unknown error"\) : "Unknown error"\)/g, 
    '(error instanceof Error ? error.message : "Unknown error")');
  // Fix: error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : 'Unknown error'
  content = content.replace(/error instanceof Error \? \(error instanceof Error \? error\.message : "Unknown error"\)/g,
    'error instanceof Error ? error.message');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

function walk(dir) {
  let count = 0;
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== 'node_modules' && f !== '.next' && f !== '.git') {
        count += walk(full);
      }
    } else if (full.endsWith('.ts') || full.endsWith('.tsx')) {
      if (fixFile(full)) count++;
    }
  });
  return count;
}

const changed = walk('src') + walk('scripts');
console.log('Files with catch/TODO fixes:', changed);
