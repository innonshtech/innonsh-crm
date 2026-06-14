const nodemailer = require('nodemailer');

async function testGoDaddy() {
  const host = 'smtpout.secureserver.net';
  const port = 587;
  const secure = false; // false for 587 (uses STARTTLS)
  const user = 'amit.gangajaliwale@innonsh.com';
  const pass = 'Akshaya@1611';

  console.log('Testing SMTP connection with GoDaddy on Port 587 (STARTTLS)...');
  
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false // Avoid self-signed certificate issues
    }
  });

  try {
    console.log('Verifying connection...');
    await transporter.verify();
    console.log('✅ GoDaddy SMTP on Port 587 verified successfully!');
    
    console.log('Attempting to send a test email...');
    const info = await transporter.sendMail({
      from: `"Innonsh Sales Team" <${user}>`,
      to: 'vaibhav.innonsh@gmail.com',
      subject: '🔑 Test SMTP GoDaddy 587',
      text: 'This is a test email sent using GoDaddy SMTP on Port 587 (STARTTLS).',
      html: '<b>This is a test email sent using GoDaddy SMTP on Port 587 (STARTTLS).</b>'
    });
    console.log('✅ Email sent successfully! Message ID:', info.messageId);
  } catch (err) {
    console.error('❌ SMTP test failed:');
    console.error(err);
  }
}

testGoDaddy();
