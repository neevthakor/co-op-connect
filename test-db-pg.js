const { Client } = require('pg');

async function test(url) {
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    console.log('Success with:', url);
    await client.end();
  } catch (err) {
    console.error('Failed with:', url);
    console.error(err.message);
  }
}

test(process.env.DATABASE_URL || "postgresql://postgres.qzuoczcyeckdtjaqmxkg:Iamneevthakor@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1");
test("postgresql://postgres.qzuoczcyeckdtjaqmxkg:Iamneevthakor@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres");
test("postgresql://postgres.qzuoczcyeckdtjaqmxkg:ruoxking%40gmail.com@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true");
test("postgresql://postgres.qzuoczcyeckdtjaqmxkg:ruoxking%40gmail.com@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres");
