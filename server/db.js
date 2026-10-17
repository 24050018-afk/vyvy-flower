import 'dotenv/config';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: Number(process.env.DB_PORT) || 4000,
  user: process.env.DB_USER || '3bJEh3ZP6bEQWpn.root',
  password: process.env.DB_PASSWORD || 'MAT_KHAU_TIDB_CUA_BAN',
  database: process.env.DB_NAME || 'test',
  ssl: process.env.DB_SSL === 'false' ? undefined : {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export { pool };
export default pool;
