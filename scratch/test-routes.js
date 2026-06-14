const http = require('http');

// Helper to send HTTP requests and return headers + body
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

async function testAll() {
  try {
    console.log('1. Testing Login as Owner...');
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

    console.log(`Login status: ${loginRes.statusCode}`);
    if (loginRes.statusCode !== 200) {
      console.error('❌ Login failed:', loginRes.body);
      return;
    }

    // Extract cookie
    const setCookie = loginRes.headers['set-cookie'];
    if (!setCookie) {
      console.error('❌ No cookies returned from login.');
      return;
    }
    const cookies = setCookie.map(c => c.split(';')[0]).join('; ');
    console.log('✅ Logged in successfully! Received token cookies.');

    console.log('\n2. Testing /api/reports endpoint (aggregating BI datasets)...');
    const reportsRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/reports',
      method: 'GET',
      headers: {
        'Cookie': cookies
      }
    });

    console.log(`Reports API status: ${reportsRes.statusCode}`);
    if (reportsRes.statusCode === 200) {
      const data = JSON.parse(reportsRes.body);
      console.log('✅ Reports API returned data successfully!');
      console.log('Funnel Conversion Rate:', data.data.funnel.conversionRate + '%');
      console.log('Total Deals Pipeline:', data.data.pipeline.totalPipelineValue);
      console.log('Leaderboard Count:', data.data.leaderboard.length);
    } else {
      console.error('❌ Failed to fetch reports data:', reportsRes.body);
    }

    console.log('\n3. Testing /api/auth/me to verify active session modules...');
    const meRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Cookie': cookies
      }
    });

    console.log(`Me API status: ${meRes.statusCode}`);
    if (meRes.statusCode === 200) {
      const payload = JSON.parse(meRes.body);
      const modules = payload.user.enabledModules;
      console.log('✅ /api/auth/me returned user session.');
      console.log('Includes reports module:', modules.includes('reports') ? '✅ Yes' : '❌ No');
      console.log('Includes analytics module (should be removed):', modules.includes('analytics') ? '❌ Yes' : '✅ No (Successfully removed!)');
    } else {
      console.error('❌ Failed to fetch session info:', meRes.body);
    }

  } catch (err) {
    console.error('💥 Error during testing:', err.message);
  }
}

testAll();
