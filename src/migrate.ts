import 'dotenv/config';
import path from 'path';
import { Client } from 'pg';
import Postgrator from 'postgrator';

export async function runMigrations(): Promise<void> {
  const client = new Client({
    connectionString:
      process.env.DATABASE_URL ||
      'postgres://postgres:postgres@localhost:5432/docs_classifier',
  });

  await client.connect();

  try {
    const postgrator = new Postgrator({
      migrationPattern: path.join(__dirname, '..', 'migrations', '*'),
      driver: 'pg',
      database: new URL(
        process.env.DATABASE_URL ||
          'postgres://postgres:postgres@localhost:5432/docs_classifier'
      ).pathname.slice(1),
      schemaTable: 'schema_migrations',
      execQuery: (query: string) => client.query(query),
    });

    const appliedMigrations = await postgrator.migrate();

    if (appliedMigrations.length > 0) {
      console.log(
        `Applied ${appliedMigrations.length} migration(s):`,
        appliedMigrations.map((m) => m.name).join(', ')
      );
    } else {
      console.log('No new migrations to apply.');
    }
  } finally {
    await client.end();
  }
}

// Allow running directly: npx ts-node src/migrate.ts
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Migrations completed.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
