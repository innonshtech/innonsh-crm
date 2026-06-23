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

async function testFilter(path, name, cookies) {
  console.log(`Testing filter [${name}] -> ${path}`);
  const res = await request({
    hostname: 'localhost',
    port: 5000,
    path: encodeURI(path),
    method: 'GET',
    headers: {
      'Cookie': cookies
    }
  });

  if (res.statusCode === 200) {
    const data = JSON.parse(res.body);
    console.log(`  ✅ SUCCESS! Leads count: ${data.leads.length}`);
    if (data.leads.length > 0) {
      console.log(`  Sample item company: ${data.leads[0].company} | Status: ${data.leads[0].status} | Priority: ${data.leads[0].priority} | Source: ${data.leads[0].source}`);
    }
  } else {
    console.error(`  ❌ FAILED! Status: ${res.statusCode}, Body: ${res.body}`);
  }
}

async function main() {
  try {
    // 1. Temporarily change org ID in database BEFORE login
    const { Client } = require('pg');
    const pathResolve = require('path');
    const dotenv = require('dotenv');
    dotenv.config({ path: pathResolve.resolve(__dirname, '../.env.local') });
    
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    await client.query("UPDATE public.users SET org_id = '52798919-80e2-48b4-a473-92608550cac6' WHERE email = 'owner@mycompany.com'");
    await client.end();

    // 2. Log in
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

    // 3. Run filters
    await testFilter('/api/leads?search=VyomX', 'Search (VyomX)', cookies);
    await testFilter('/api/leads?status=New', 'Status (New)', cookies);
    await testFilter('/api/leads?status=Active', 'Status (Active)', cookies);
    await testFilter('/api/leads?source=Website', 'Source (Website)', cookies);
    await testFilter('/api/leads?priority=Warm', 'Priority (Warm)', cookies);
    await testFilter('/api/leads?interestedProduct=Innonsh ClinicPro', 'Interested Product (Innonsh ClinicPro)', cookies);
    await testFilter('/api/leads?sortBy=newest', 'SortBy (Newest Created)', cookies);
    await testFilter('/api/leads?sortBy=latest_communication', 'SortBy (Latest Communication/Follow-up)', cookies);

    // 4. Revert org ID
    const clientRestore = new Client({ connectionString: process.env.DATABASE_URL });
    await clientRestore.connect();
    await clientRestore.query("UPDATE public.users SET org_id = '99db4912-3e8f-450a-80d9-872517ff4ad3' WHERE email = 'owner@mycompany.com'");
    await clientRestore.end();

  } catch (err) {
    console.error('💥 Error:', err);
  }
}

main();
