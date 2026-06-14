async function test() {
  console.log('--- Calling Seed API ---');
  try {
    const seedRes = await fetch('http://localhost:5000/api/auth/seed');
    const seedData = await seedRes.json();
    console.log('Seed response:', seedData);
  } catch (err) {
    console.error('Seed request failed:', err.message);
  }

  console.log('\n--- Calling Forgot Password API ---');
  try {
    const forgotRes = await fetch('http://localhost:5000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@mycompany.com' })
    });
    const forgotData = await forgotRes.json();
    console.log('Forgot Password response status:', forgotRes.status);
    console.log('Forgot Password response body:', forgotData);
  } catch (err) {
    console.error('Forgot password request failed:', err.message);
  }
}

test();
