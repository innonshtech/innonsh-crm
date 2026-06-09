require('dotenv').config({ path: '.env' });
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const email = 'admin@innonsh.com';
    const password = 'admin123';
    
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    // Check if user exists
    const res = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (res.rows.length > 0) {
      await client.query('UPDATE users SET password = $1, is_super_admin = true, role = $2 WHERE email = $3', [hash, 'owner', email]);
      console.log('Updated existing admin@innonsh.com');
    } else {
      await client.query(`
        INSERT INTO users (name, email, password, role, is_super_admin, approval_status, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, ['Platform Admin', email, hash, 'owner', true, 'Approved', true]);
      console.log('Created admin@innonsh.com with password: admin123');
    }
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await client.end();
  }
}

run();
