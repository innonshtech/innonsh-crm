const nodemailer = require('nodemailer');

async function testGmail() {
  const host = 'smtp.gmail.com';
  const port = 465;
  const secure = true;
  const user = 'vaibhav.innonsh@gmail.com';
  // Strip spaces if present, though nodemailer handles them
  const pass = 'zjyv jjkr npsp migl'; 

  console.log('Testing SMTP connection with Gmail...');
  
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  try {
    // Verify connection configuration
    console.log('Verifying connection configuration...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully! The credentials and connection parameters are CORRECT.');
    
    // Attempt to send a test email to the user themselves
    console.log('Attempting to send a test email...');
    const info = await transporter.sendMail({
      from: `"Innonsh Sales Team" <${user}>`,
      to: user,
      subject: '🔑 Test SMTP Verification',
      text: 'If you are reading this, your Gmail SMTP configuration is working perfectly!',
      html: '<b>If you are reading this, your Gmail SMTP configuration is working perfectly!</b>'
    });
    console.log('✅ Email sent successfully! Message ID:', info.messageId);
  } catch (err) {
    console.error('❌ SMTP test failed:');
    console.error(err);
  }
}

testGmail();
