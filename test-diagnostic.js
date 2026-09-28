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
  
  let safeUrl = urlStr;
  try {
    const u = new URL(urlStr);
    u.password = '***';
    safeUrl = u.toString();
  } catch(e) {}

  console.log(`\nTesting ${name}: ${safeUrl}`);
  
  const client = new Client({ connectionString: urlStr, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    console.log(`✅ ${name} Connection SUCCESS!`);
    const res = await client.query('SELECT 1 as result');
    console.log('Query result:', res.rows);
    await client.end();
    return true;
  } catch (err) {
    console.error(`❌ ${name} Connection FAILED:`, err.message);
    return false;
  }
}

async function main() {
  console.log('--- TESTING PG CLIENT ---');
  await testConnection('DATABASE_URL', env.DATABASE_URL);
  await testConnection('DIRECT_URL', env.DIRECT_URL);
}

main();
