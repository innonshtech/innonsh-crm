const http = require('http');

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function testLeadsApi() {
  try {
    console.log('1. Logging in...');
    const loginPayload = JSON.stringify({
      email: 'owner@mycompany.com',
      password: 'ownerpassword123'
    });

    const loginRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginPayload)
      }
    }, loginPayload);

    if (loginRes.statusCode !== 200) {
      console.error('❌ Login failed:', loginRes.body);
      return;
    }

    const setCookie = loginRes.headers['set-cookie'];
    const cookies = setCookie.map(c => c.split(';')[0]).join('; ');
    console.log('✅ Logged in successfully!');

    // Call me api
    const meRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Cookie': cookies
      }
    });
    console.log('Me details:', meRes.body);

    console.log('\n2. Querying leads api with sortBy=latest_communication...');
    const leadsRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/leads?status=&sortBy=latest_communication',
      method: 'GET',
      headers: {
        'Cookie': cookies
      }
    });

    console.log(`Leads API status: ${leadsRes.statusCode}`);
    if (leadsRes.statusCode === 200) {
      const data = JSON.parse(leadsRes.body);
      console.log('✅ Leads API success! Returned leads count:', data.leads.length);
      console.log('First 5 sorted leads:');
      data.leads.slice(0, 5).forEach((l, i) => {
        console.log(`${i+1}. [${l.id}] ${l.firstName} ${l.lastName} | Notes: ${l.notes.length} | Created: ${l.createdAt}`);
      });
    } else {
      console.error('❌ Failed to fetch leads:', leadsRes.body);
    }
  } catch (err) {
    console.error('💥 Error:', err.message);
  }
}

testLeadsApi();
