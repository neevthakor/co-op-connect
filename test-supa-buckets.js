const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*"?([^"\r\n]+)/);
const keyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*"?([^"\r\n]+)/);

const url = urlMatch ? urlMatch[1] : null;
const key = keyMatch ? keyMatch[1] : null;

const { createClient } = require('@supabase/supabase-js');
const c = createClient(url, key);

async function test() {
  console.log('Checking storage buckets...');
  try {
    const res = await c.storage.listBuckets();
    console.log('Buckets:', res.data);
    console.log('Error:', res.error);
  } catch (e) {
    console.log('Catch Error:', e);
  }
}

test();
