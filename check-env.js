const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8').split('\n');
const keyLine = env.find(l => l.startsWith('SUPABASE_SECRET_KEY'));
if (keyLine) {
  const val = keyLine.split('=')[1].replace(/"/g, '').trim();
  console.log('Exists:', !!val);
  console.log('Starts with sb_secret_:', val.startsWith('sb_secret_'));
  console.log('Length:', val.length);
} else {
  console.log('SUPABASE_SECRET_KEY not found in .env');
}
