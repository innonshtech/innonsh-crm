const nodemailer = require('nodemailer');

async function testNewGoDaddy() {
  const host = 'smtpout.secureserver.net';
  const user = 'info@innonsh.com';
  const pass = 'Innonsh@932389';

  console.log('--- Testing Port 465 (SSL) ---');
  try {
    const transporter465 = nodemailer.createTransport({
      host,
      port: 465,
      secure: true,
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });
    await transporter465.verify();
    console.log('✅ Success on Port 465!');
  } catch (err465) {
    console.error('❌ Failed on Port 465:', err465.message);
  }

  console.log('\n--- Testing Port 587 (STARTTLS) ---');
  try {
    const transporter587 = nodemailer.createTransport({
      host,
      port: 587,
      secure: false,
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });
    await transporter587.verify();
    console.log('✅ Success on Port 587!');
  } catch (err587) {
    console.error('❌ Failed on Port 587:', err587.message);
  }
}

testNewGoDaddy();
