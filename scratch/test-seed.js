const http = require('http');

console.log('Sending GET to /api/auth/seed...');
http.get('http://localhost:5000/api/auth/seed', (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Response:', data);
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
