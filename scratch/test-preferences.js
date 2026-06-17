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

    req.on('error', (e) => { reject(e); });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function testPreferences() {
  try {
    console.log('1. Logging in as Owner...');
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

    const setCookie = loginRes.headers['set-cookie'];
    if (!setCookie) {
      console.error('❌ No cookies returned from login.');
      return;
    }
    const cookies = setCookie.map(c => c.split(';')[0]).join('; ');
    console.log('✅ Logged in successfully!');

    console.log('\n2. Fetching current settings...');
    const getRes1 = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/tenant/settings',
      method: 'GET',
      headers: { 'Cookie': cookies }
    });

    console.log(`GET /api/tenant/settings status: ${getRes1.statusCode}`);
    console.log('Current settings:', getRes1.body);
    const initialSettings = JSON.parse(getRes1.body);

    console.log('\n3. Updating settings via PUT (Inactivity: 3 days, Overdue grace: 2 days)...');
    const updatePayload = JSON.stringify({
      leadInactivityDays: 3,
      followUpOverdueDays: 2
    });

    const putRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/tenant/settings',
      method: 'PUT',
      headers: {
        'Cookie': cookies,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(updatePayload)
      }
    }, updatePayload);

    console.log(`PUT /api/tenant/settings status: ${putRes.statusCode}`);
    console.log('Updated settings response:', putRes.body);

    console.log('\n4. Fetching settings again to verify state retention...');
    const getRes2 = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/tenant/settings',
      method: 'GET',
      headers: { 'Cookie': cookies }
    });

    console.log(`GET /api/tenant/settings status: ${getRes2.statusCode}`);
    console.log('Retrieved updated settings:', getRes2.body);
    const finalSettings = JSON.parse(getRes2.body);

    if (finalSettings.settings.leadInactivityDays === 3 && finalSettings.settings.followUpOverdueDays === 2) {
      console.log('✅ Settings successfully updated and verified!');
    } else {
      console.error('❌ Settings update verification failed!');
    }

    console.log('\n5. Restoring initial settings to leave DB clean...');
    const restorePayload = JSON.stringify({
      leadInactivityDays: initialSettings.settings?.leadInactivityDays ?? 7,
      followUpOverdueDays: initialSettings.settings?.followUpOverdueDays ?? 0
    });

    const restoreRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/tenant/settings',
      method: 'PUT',
      headers: {
        'Cookie': cookies,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(restorePayload)
      }
    }, restorePayload);
    console.log(`Restore status: ${restoreRes.statusCode}`);
    console.log('✅ DB clean complete.');

  } catch (err) {
    console.error('💥 Error during test:', err.message);
  }
}

testPreferences();
