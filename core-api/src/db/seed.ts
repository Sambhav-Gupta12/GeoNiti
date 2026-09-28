import path from 'path';
import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('DATABASE_URL required'); process.exit(1); }

const pool = new Pool({ connectionString: DATABASE_URL });

async function runSeed(client: PoolClient, name: string, fn: (c: PoolClient) => Promise<void>) {
  process.stdout.write(`  seeding ${name}... `);
  await fn(client);
  console.log('done');
}

async function printCounts(client: PoolClient) {
  const tables = [
    'organizations','roles','users','regions','documents','document_regions',
    'policies','datasets','dataset_versions','geo_layers','indicators',
    'indicator_values','projects','project_members','project_items',
    'scenarios','scenario_runs','evidence_links','annotations',
    'chat_sessions','chat_messages','challenges','audit_events','notifications'
  ];
  console.log('\n--- Table row counts ---');
  for (const t of tables) {
    const { rows } = await client.query(`SELECT COUNT(*) FROM ${t}`);
    console.log(`  ${t.padEnd(26)} ${rows[0].count}`);
  }
}

async function main() {
  const client = await pool.connect();
  try {
    const seedDir = path.resolve(__dirname, '../../db/seeds');
    const files = [
      '01_organizations',
      '02_users',
      '03_regions',
      '04_indicators',
      '05_datasets',
      '06_documents',
      '07_policies_links',
      '08_challenges_projects',
    ];

    for (const file of files) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require(path.join(seedDir, file));
      await runSeed(client, file, mod.seed);
    }

    await printCounts(client);
    console.log('\nSeed complete.');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
