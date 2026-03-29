const { Client } = require('pg');

async function test(url) {
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    console.log(`Success: ${url.replace(/:([^@]+)@/, ':***@')}`);
    await client.end();
  } catch (err) {
    console.error(`Failed: ${url.replace(/:([^@]+)@/, ':***@')} -> ${err.message}`);
  }
}

async function run() {
  const urls = [
    "postgresql://postgres.wzjwanopndljqcpewonh:Mo%40cySo%40res269@aws-0-sa-east-1.pooler.supabase.com:5432/postgres",
    "postgresql://postgres:Mo%40cySo%40res269@aws-0-sa-east-1.pooler.supabase.com:5432/postgres",
    "postgresql://postgres.wzjwanopndljqcpewonh:Mo%40cySo%40res269@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"
  ];
  for (const url of urls) {
    await test(url);
  }
}
run();
