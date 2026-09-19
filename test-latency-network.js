const { Client } = require('pg');
const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');
const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');

// Load environment variables
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    process.env[match[1]] = match[2].trim().replace(/^"|"$/g, '');
  }
});

function calculateStats(times) {
  const min = Math.min(...times);
  const max = Math.max(...times);
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  return { min: min.toFixed(2), avg: avg.toFixed(2), max: max.toFixed(2) };
}

async function runTestsForUrl(name, connectionString) {
  console.log(`\n=== Testing ${name} ===`);
  
  // Test 1: New connection per query (10 times)
  const connectTimes = [];
  const individualQueryTimes = [];
  
  for (let i = 0; i < 10; i++) {
    const client = new Client({ connectionString });
    
    const tConnectStart = performance.now();
    await client.connect();
    const tConnectEnd = performance.now();
    connectTimes.push(tConnectEnd - tConnectStart);
    
    const tQueryStart = performance.now();
    await client.query('SELECT 1');
    const tQueryEnd = performance.now();
    individualQueryTimes.push(tQueryEnd - tQueryStart);
    
    if (i === 0) {
      const res = await client.query('SELECT now()');
      console.log(`[${name}] DB Time (SELECT now()):`, res.rows[0].now);
    }
    
    await client.end();
  }
  
  const connectStats = calculateStats(connectTimes);
  const individualQueryStats = calculateStats(individualQueryTimes);
  
  console.log(`[${name}] Connection Establishment (10 runs): Min ${connectStats.min}ms, Avg ${connectStats.avg}ms, Max ${connectStats.max}ms`);
  console.log(`[${name}] Query Round-Trip on NEW connection (10 runs): Min ${individualQueryStats.min}ms, Avg ${individualQueryStats.avg}ms, Max ${individualQueryStats.max}ms`);
  
  // Test 2: Reused connection (10 queries)
  const reusedQueryTimes = [];
  const persistentClient = new Client({ connectionString });
  
  await persistentClient.connect();
  
  // Warmup
  await persistentClient.query('SELECT 1');
  
  for (let i = 0; i < 10; i++) {
    const tQueryStart = performance.now();
    await persistentClient.query('SELECT 1');
    const tQueryEnd = performance.now();
    reusedQueryTimes.push(tQueryEnd - tQueryStart);
  }
  
  await persistentClient.end();
  
  const reusedQueryStats = calculateStats(reusedQueryTimes);
  console.log(`[${name}] Query Round-Trip on REUSED connection (10 runs): Min ${reusedQueryStats.min}ms, Avg ${reusedQueryStats.avg}ms, Max ${reusedQueryStats.max}ms`);
}

async function main() {
  try {
    await runTestsForUrl('DATABASE_URL (:6543)', process.env.DATABASE_URL);
    await runTestsForUrl('DIRECT_URL (:5432)', process.env.DIRECT_URL);
  } catch (e) {
    console.error("Error during test:", e.message);
  }
}

main();
