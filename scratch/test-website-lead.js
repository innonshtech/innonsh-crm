const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const apiKey = process.env.WEBSITE_API_KEY;
console.log('Loaded WEBSITE_API_KEY from .env.local:', apiKey);

const leadData = {
  name: "Amit Kumar",
  companyName: "Kumar Tech Solutions",
  email: "amit.kumar@kumartech.com",
  phone: "+919988776655",
  service: "Web Integration",
  interestedProduct: "Innonsh ClinicPro",
  employeeCount: "10-50",
  message: "Hi, this is a test website lead to see if it shows up on the Product Leads page!"
};

async function test() {
  try {
    const url = 'http://localhost:5000/api/leads/website';
    console.log('Sending POST request to:', url);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(leadData)
    });

    const data = await response.json();
    console.log('Status Code:', response.status);
    console.log('Response Body:', data);
  } catch (err) {
    console.error('Error in request:', err.message);
  }
}

test();
