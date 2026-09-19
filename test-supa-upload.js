const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*"?([^"\r\n]+)/);
const keyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*"?([^"\r\n]+)/);

const url = urlMatch ? urlMatch[1] : null;
const key = keyMatch ? keyMatch[1] : null;

const { createClient } = require('@supabase/supabase-js');
const c = createClient(url, key);

async function test() {
  console.log('Checking storage...');
  const start = Date.now();
  try {
    const file = new Blob(['hello world'], { type: 'text/plain' });
    const res = await c.storage.from('private-uploads').upload('test.txt', file, { upsert: true });
    console.log('Time:', Date.now() - start, 'ms');
    console.log('Data:', res.data);
    console.log('Error:', res.error);
  } catch (e) {
    console.log('Catch Error:', e);
  }
}

test();
