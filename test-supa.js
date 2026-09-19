const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*"?([^"\r\n]+)/);
const keyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*"?([^"\r\n]+)/);

const url = urlMatch ? urlMatch[1] : null;
const key = keyMatch ? keyMatch[1] : null;

const { createClient } = require('@supabase/supabase-js');
const c = createClient(url, key);

console.log('Checking storage...');
const start = Date.now();
c.storage.getBucket('private-uploads').then(r => {
  console.log('Time:', Date.now() - start, 'ms');
  console.log('Data:', r.data);
  console.log('Error:', r.error);
  process.exit(0);
}).catch(e => {
  console.log('Catch Error:', e);
  process.exit(1);
});
