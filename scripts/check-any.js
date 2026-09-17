const fs = require('fs');

const data = JSON.parse(fs.readFileSync('eslint-report-any.json', 'utf8'));
let count = 0;
data.forEach(file => {
  file.messages.forEach(msg => {
    if (msg.ruleId === '@typescript-eslint/no-explicit-any') {
      count++;
      console.log(`${file.filePath}:${msg.line} - ${msg.message}`);
    }
  });
});
console.log('Total any left:', count);
