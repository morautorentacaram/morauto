const { Client } = require('pg');

const regions = [
  "us-east-1", "us-east-2", "us-west-1", "us-west-2",
  "eu-west-1", "eu-west-2", "eu-central-1",
  "ap-south-1", "ap-southeast-1", "ap-southeast-2",
  "ap-northeast-1", "ap-northeast-2",
  "sa-east-1", "ca-central-1"
];

async function testRegion(region) {
  const url = `postgresql://postgres.wzjwanopndljqcpewonh:Mo%40cySo%40res269@aws-0-${region}.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`;
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    console.log(`FOUND_REGION: ${region}`);
    await client.end();
    process.exit(0); // exit immediately when found
  } catch (err) {
    // console.error(`Failed ${region}: ${err.message}`);
  }
}

async function run() {
  console.log("Testing regions on 6543...");
  await Promise.allSettled(regions.map(r => testRegion(r)));
  console.log("Done testing all regions, none worked.");
}
run();
