const fs = require('fs');
const path = require('path');

const replacements = {
    'â‚¹': '₹',
    'â€¢': '•',
    'â€™': '\'',
    'â€œ': '\"',
    'â€?': '\"',
    'â€“': '-',
    'â€”': '--',
    'â­': '⭐',
    'Ã': '',
    'Â': ''
};

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.md')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./src');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    for (const [key, value] of Object.entries(replacements)) {
        if (content.includes(key)) {
            content = content.split(key).join(value);
            modified = true;
        }
    }
    if (modified) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed mojibake in', file);
    }
});
