import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

import 'dotenv/config';

async function importSQL() {
  const sqlPath = path.resolve('database.sql');
  console.log(`[Import] Reading SQL file from: ${sqlPath}`);
  
  if (!fs.existsSync(sqlPath)) {
    console.error(`[Error] File not found: ${sqlPath}`);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(sqlPath, 'utf8');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port: Number(process.env.DB_PORT) || 4000,
    user: process.env.DB_USER || '3bJEh3ZP6bEQWpn.root',
    password: process.env.DB_PASSWORD || 'MAT_KHAU_TIDB_CUA_BAN',
    database: process.env.DB_NAME || 'test',
    ssl: process.env.DB_SSL === 'false' ? undefined : {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true,
    },
    multipleStatements: true,
  });

  console.log('[Import] Connected to MySQL. Executing database.sql...');
  await connection.query(sqlContent);
  console.log('[Import] Successfully imported database.sql into MySQL!');
  await connection.end();
}

importSQL().catch((err) => {
  console.error('[Import Error]', err.message);
  process.exit(1);
});
