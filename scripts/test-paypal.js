// PayPal Integration Test Script
// Run with: node scripts/test-paypal.js

const https = require('https');

// Load environment variables
require('dotenv').config({ path: '.env.production' });

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_BASE_URL = 'https://api-m.paypal.com'; // Live environment

console.log('🔍 PayPal Integration Test Starting...\n');

// Test 1: Check credentials
console.log('1️⃣ Checking Credentials:');
console.log(`   Client ID: ${PAYPAL_CLIENT_ID ? PAYPAL_CLIENT_ID.substring(0, 20) + '...' : 'MISSING'}`);
console.log(`   Client Secret: ${PAYPAL_CLIENT_SECRET ? PAYPAL_CLIENT_SECRET.substring(0, 10) + '...' : 'MISSING'}`);
console.log(`   Environment: LIVE (${PAYPAL_BASE_URL})\n`);

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  console.error('❌ CRITICAL: Missing PayPal credentials!');
  process.exit(1);
}

// Test 2: Get Access Token
async function getAccessToken() {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    const postData = 'grant_type=client_credentials';
    
    const options = {
      hostname: 'api-m.paypal.com',
      port: 443,
      path: '/v1/oauth2/token',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          resolve(response.access_token);
        } else {
          reject(new Error(`Auth failed: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Test 3: Create Test Order
async function createTestOrder(accessToken) {
  return new Promise((resolve, reject) => {
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: '10.00'
        },
        description: 'Test Order - OZPTides'
      }],
      application_context: {
        brand_name: 'OZPTides',
        user_action: 'PAY_NOW',
        return_url: 'https://ozptides.com/checkout/success',
        cancel_url: 'https://ozptides.com/checkout'
      }
    };

    const postData = JSON.stringify(orderData);
    
    const options = {
      hostname: 'api-m.paypal.com',
      port: 443,
      path: '/v2/checkout/orders',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 201) {
          const response = JSON.parse(data);
          resolve(response);
        } else {
          reject(new Error(`Order creation failed: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Run Tests
async function runTests() {
  try {
    console.log('2️⃣ Testing Authentication...');
    const accessToken = await getAccessToken();
    console.log('   ✅ Authentication successful!\n');

    console.log('3️⃣ Testing Order Creation...');
    const order = await createTestOrder(accessToken);
    console.log('   ✅ Order creation successful!');
    console.log(`   Order ID: ${order.id}`);
    console.log(`   Status: ${order.status}`);
    
    const approvalUrl = order.links?.find(link => link.rel === 'approve')?.href;
    if (approvalUrl) {
      console.log(`   ✅ Approval URL generated: ${approvalUrl.substring(0, 50)}...\n`);
    } else {
      console.log('   ⚠️  No approval URL found in response\n');
    }

    console.log('4️⃣ Account Status Check...');
    console.log('   ✅ PayPal API is responding correctly');
    console.log('   ✅ Credentials are valid');
    console.log('   ✅ Order creation flow works\n');

    console.log('🎉 ALL TESTS PASSED!');
    console.log('📋 Next Steps:');
    console.log('   1. Verify your PayPal business account is fully verified');
    console.log('   2. Check if there are any receiving payment restrictions');
    console.log('   3. Ensure USD currency is enabled and auto-accept is on');
    console.log('   4. Test with a real PayPal account (not the same as merchant account)');

  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    
    if (error.message.includes('401')) {
      console.log('\n🔧 SOLUTION: Invalid credentials');
      console.log('   - Double-check Client ID and Secret in .env.production');
      console.log('   - Ensure no extra spaces or characters');
      console.log('   - Verify you\'re using LIVE credentials (not sandbox)');
    } else if (error.message.includes('403')) {
      console.log('\n🔧 SOLUTION: Account restrictions');
      console.log('   - Your PayPal business account may not be fully verified');
      console.log('   - Check PayPal dashboard for verification requirements');
      console.log('   - Ensure receiving payments is enabled');
    } else if (error.message.includes('422')) {
      console.log('\n🔧 SOLUTION: Request validation error');
      console.log('   - Check currency settings in PayPal account');
      console.log('   - Verify USD is enabled and accepted');
    }
  }
}

runTests();
