const fs = require('fs');
const { Client } = require('pg');

const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...vParts] = line.split('=');
  const v = vParts.join('=');
  if (k && v) env[k.trim()] = v.trim().replace(/^"|"/g, '');
});

async function testConnection(name, urlStr) {
  if (!urlStr) {
    console.log(`${name} is not set.`);
    return false;
  }
  
  const client = new Client({ connectionString: urlStr, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    console.log(`✅ ${name} Connection SUCCESS!`);
    await client.end();
    return true;
  } catch (err) {
    console.error(`❌ ${name} Connection FAILED:`, err.message);
    return false;
  }
}

async function main() {
  console.log('--- TESTING PG CLIENT WITH SSLMODE ---');
  
  // Test 6543 with sslmode=require
  let dbUrl = env.DATABASE_URL;
  if (!dbUrl.includes('sslmode=require')) {
    dbUrl += '&sslmode=require';
  }
  await testConnection('DATABASE_URL (sslmode=require)', dbUrl);

  // Test 6543 with sslmode=disable
  let dbUrlDisable = env.DATABASE_URL;
  dbUrlDisable += '&sslmode=disable';
  await testConnection('DATABASE_URL (sslmode=disable)', dbUrlDisable);
}

main();
