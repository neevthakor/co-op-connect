const fs = require('fs');
const path = require('path');

// Generic record type that replaces most `any` uses for API response data
const RECORD_TYPE = 'Record<string, unknown>';

function fixAnyInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Pattern: useState<any>(null) or useState<any>({})  
  // Replace with useState<Record<string, unknown> | null>(null)
  content = content.replace(/useState<any>\(null\)/g, `useState<${RECORD_TYPE} | null>(null)`);
  content = content.replace(/useState<any>\(\{\}\)/g, `useState<${RECORD_TYPE}>({})`);
  
  // Pattern: useState<any[]>([])
  content = content.replace(/useState<any\[\]>\(\[\]\)/g, `useState<${RECORD_TYPE}[]>([])`);

  // Pattern: useState<any>(initialSomething) where initialSomething is a variable
  content = content.replace(/useState<any>\((\w+)\)/g, `useState<${RECORD_TYPE}>($1)`);

  // Pattern: (item: any) => in map/filter/forEach callbacks  
  // BUT only inside .map( .filter( .forEach( .find( .some( .every( .reduce( .flatMap(
  content = content.replace(/\.\s*(map|filter|forEach|find|some|every|flatMap)\s*\(\s*\((\w+):\s*any\)/g, 
    '.$1(($2: ${RECORD_TYPE})'.replace('${RECORD_TYPE}', RECORD_TYPE));
  
  // Pattern: (item: any, index: number) in map callbacks
  content = content.replace(/\.\s*(map|filter|forEach|find|some|every|flatMap)\s*\(\s*\((\w+):\s*any,\s*(\w+):\s*(?:any|number)\)/g, 
    '.$1(($2: ${RECORD_TYPE}, $3: number)'.replace(/\$\{RECORD_TYPE\}/g, RECORD_TYPE));

  // Pattern: [key, value]: [string, any]  
  content = content.replace(/\[(\w+),\s*(\w+)\]:\s*\[string,\s*any\]/g, `[$1, $2]: [string, ${RECORD_TYPE}]`);

  // Pattern: { data: any[] } in props
  content = content.replace(/\{\s*data:\s*any\[\]\s*\}/g, `{ data: ${RECORD_TYPE}[] }`);

  // Pattern: (row: any) => standalone in column definitions
  content = content.replace(/\(row:\s*any\)/g, `(row: ${RECORD_TYPE})`);

  // Pattern: : any = null or : any; at end of line  
  content = content.replace(/:\s*any\s*=\s*null/g, `: ${RECORD_TYPE} | null = null`);

  // Pattern: let channelInstance: any = null
  content = content.replace(/let\s+(\w+):\s*any\s*=\s*null/g, `let $1: ${RECORD_TYPE} | null = null`);

  // Pattern: as any  (type assertion)
  content = content.replace(/\bas\s+any\b/g, `as unknown`);

  // Pattern: catch (e: any) { - should already be handled but just in case
  content = content.replace(/catch\s*\(\s*(\w+)\s*:\s*any\s*\)/g, 'catch ($1)');

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
      if (fixAnyInFile(full)) count++;
    }
  });
  return count;
}

const changed = walk('src') + walk('scripts');
console.log('Files with any type fixes:', changed);
