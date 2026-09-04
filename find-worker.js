const fs = require('fs');
const { execSync } = require('child_process');

const files = execSync('git ls-files').toString().split('\n').filter(Boolean);

files.forEach(f => {
  if (f.includes('node_modules') || f.includes('.next')) return;
  try {
    const content = fs.readFileSync(f, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, i) => {
      // Look for any string starting with /worker (excluding /workers API routes to reduce noise)
      if (line.match(/['"`]\/worker(?!\w|s)/)) {
        console.log(`${f}:${i+1}: ${line.trim()}`);
      }
    });
  } catch(e){}
});
