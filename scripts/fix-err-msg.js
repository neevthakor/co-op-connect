const fs = require('fs'); const path = require('path'); 
function replaceCatchBlocks(dir) { 
  fs.readdirSync(dir).forEach(f => { 
    const full = path.join(dir, f); 
    if (fs.statSync(full).isDirectory()) { 
      if (!['node_modules', '.next', '.git'].includes(f)) { 
        replaceCatchBlocks(full); 
      } 
    } else if (full.endsWith('.ts') || full.endsWith('.tsx')) { 
      let content = fs.readFileSync(full, 'utf8'); 
      let original = content; 
      content = content.replace(/\berr\.message\b/g, '(err instanceof Error ? err.message : "Unknown error")'); 
      content = content.replace(/error\.message/g, '(error instanceof Error ? error.message : "Unknown error")'); 
      if (content !== original) { 
        fs.writeFileSync(full, content, 'utf8'); 
      } 
    } 
  }); 
} 
replaceCatchBlocks('src');
