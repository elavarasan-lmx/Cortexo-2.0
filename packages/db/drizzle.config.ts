import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../../.env') });
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    host: '127.0.0.1',
    port: 3306,
    user: 'cortexo',
    password: 'cortexo_dev_2026',
    database: 'cortexo',
  },
  verbose: true,
  strict: false,
});
