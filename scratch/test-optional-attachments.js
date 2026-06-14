const http = require('http');

async function makePostRequest(url, payload, cookie = '') {
  return new Promise((resolve, reject) => {
    const dataString = JSON.stringify(payload);
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': dataString.length,
        'Cookie': cookie,
      },
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: JSON.parse(body),
        });
      });
    });

    req.on('error', (err) => reject(err));
    req.write(dataString);
    req.end();
  });
}

async function test() {
  console.log('1. Attempting login as Sales Representative...');
  const loginRes = await makePostRequest('http://localhost:5000/api/auth/login', {
    email: 'rep@mycompany.com',
    password: 'reppassword123',
  });

  if (loginRes.statusCode !== 200) {
    console.error('Failed to log in:', loginRes.body);
    process.exit(1);
  }
  console.log('Login successful!');

  // Extract the session token cookie
  const setCookieHeader = loginRes.headers['set-cookie'];
  const cookie = setCookieHeader ? setCookieHeader.map(c => c.split(';')[0]).join('; ') : '';

  console.log('2. Sending test email WITHOUT attachment...');
  const emailResNoAttach = await makePostRequest('http://localhost:5000/api/emails', {
    subject: 'Direct Follow Up (No Attachment)',
    body: 'Hi Client, this is a plain message without any proposal attachment.',
    leadId: null,
    contactId: null,
    proposalFile: '',
    proposalFileData: '',
    proposalFileMimeType: '',
    channel: 'email',
    cc: '',
  }, cookie);

  console.log('Email without attachment response status:', emailResNoAttach.statusCode);
  console.log('Email without attachment response body:', emailResNoAttach.body);

  if (emailResNoAttach.statusCode !== 201) {
    console.error('Failed to send email without attachment!');
    process.exit(1);
  }

  const savedEmail = emailResNoAttach.body.email;
  const proposalFileName = savedEmail.hasOwnProperty('proposalFile') ? savedEmail.proposalFile : savedEmail.proposal_file;
  console.log('Saved email details:');
  console.log('- ID:', savedEmail.id || savedEmail._id);
  console.log('- Proposal File Name:', JSON.stringify(proposalFileName));

  if (proposalFileName === '') {
    console.log('✅ Success! proposalFile is stored as an empty string (no dummy file sent).');
  } else {
    console.error('❌ Failure! proposalFile is still populated:', proposalFileName);
    process.exit(1);
  }

  console.log('\n3. Sending test email WITH default proposal (fallback case)...');
  const emailResWithAttach = await makePostRequest('http://localhost:5000/api/emails', {
    subject: 'Proposal with default attachment',
    body: 'Hi Client, please find {{proposalFile}} attached.',
    leadId: null,
    contactId: null,
    proposalFile: 'Proposal.pdf',
    proposalFileData: '',
    proposalFileMimeType: '',
    channel: 'email',
    cc: '',
  }, cookie);

  console.log('Email with default attachment response status:', emailResWithAttach.statusCode);
  if (emailResWithAttach.statusCode !== 201) {
    console.error('Failed to send email with default attachment!');
    process.exit(1);
  }

  const savedEmailWithAttach = emailResWithAttach.body.email;
  const proposalFileNameWithAttach = savedEmailWithAttach.hasOwnProperty('proposalFile') ? savedEmailWithAttach.proposalFile : savedEmailWithAttach.proposal_file;
  console.log('Saved email details:');
  console.log('- ID:', savedEmailWithAttach.id || savedEmailWithAttach._id);
  console.log('- Proposal File Name:', JSON.stringify(proposalFileNameWithAttach));

  if (proposalFileNameWithAttach === 'Proposal.pdf') {
    console.log('✅ Success! Default proposal filename "Proposal.pdf" is stored successfully when attached.');
  } else {
    console.error('❌ Failure! proposalFile is not "Proposal.pdf":', proposalFileNameWithAttach);
    process.exit(1);
  }
}

test().catch(console.error);
