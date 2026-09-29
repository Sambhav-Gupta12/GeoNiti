const b = require('bcryptjs');
const { Pool } = require('pg');

const hash = b.hashSync('Demo@1234', 10);
console.log('Generated hash:', hash);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('UPDATE users SET password_hash = $1', [hash])
  .then(r => {
    console.log('Updated', r.rowCount, 'users');
    return pool.query('SELECT email, LEFT(password_hash,7) as prefix FROM users');
  })
  .then(r => {
    r.rows.forEach(row => console.log(row.email, '|', row.prefix));
    pool.end();
  })
  .catch(e => { console.error(e); pool.end(); });
