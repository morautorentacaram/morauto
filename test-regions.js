const { Client } = require('pg');

const regions = [
  "us-east-1", "us-east-2", "us-west-1", "us-west-2",
  "eu-west-1", "eu-west-2", "eu-central-1",
  "ap-south-1", "ap-southeast-1", "ap-southeast-2",
  "ap-northeast-1", "ap-northeast-2",
  "sa-east-1", "ca-central-1"
];

async function testRegion(region) {
  const url = `postgresql://postgres:Mo%40cySo%40res269@aws-0-${region}.pooler.supabase.com:5432/postgres`;
  const url6543 = `postgresql://postgres:Mo%40cySo%40res269@aws-0-${region}.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`;
  
  try {
    const client = new Client({ connectionString: url });
    await client.connect();
    console.log(`FOUND_REGION_5432: ${region}`);
    await client.end();
  } catch (err) {
    if (err.message !== "Tenant or user not found") {
       console.log(`Region ${region} (5432) error: ${err.message}`);
    }
  }

  try {
    const client = new Client({ connectionString: url6543 });
    await client.connect();
    console.log(`FOUND_REGION_6543: ${region}`);
    await client.end();
  } catch (err) {
    if (err.message !== "Tenant or user not found") {
       console.log(`Region ${region} (6543) error: ${err.message}`);
    }
  }
}

async function run() {
  console.log("Testing regions with just 'postgres' as user...");
  await Promise.allSettled(regions.map(r => testRegion(r)));
  console.log("Done testing all regions, none worked.");
  process.exit(0);
}
run();
