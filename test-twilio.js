require('dotenv').config({ path: '.env.local' });
const twilio = require('twilio');

console.log('=== Twilio Configuration Test ===');
console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? `${process.env.TWILIO_ACCOUNT_SID.substring(0, 10)}...` : 'NOT SET');
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? `${process.env.TWILIO_AUTH_TOKEN.substring(0, 10)}...` : 'NOT SET');
console.log('TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER || 'NOT SET');

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
  console.error('Missing required Twilio credentials');
  process.exit(1);
}

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function testTwilioConnection() {
  try {
    console.log('\n=== Testing Twilio Account Access ===');
    
    // Test 1: Fetch account details
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    console.log('✓ Account access successful');
    console.log('Account Status:', account.status);
    console.log('Account Type:', account.type);
    
    // Test 2: List phone numbers
    console.log('\n=== Checking Phone Numbers ===');
    const phoneNumbers = await client.incomingPhoneNumbers.list({ limit: 20 });
    console.log(`Found ${phoneNumbers.length} phone numbers:`);
    
    phoneNumbers.forEach((number, index) => {
      console.log(`${index + 1}. ${number.phoneNumber} (${number.friendlyName || 'No name'}) - Status: ${number.status}`);
    });
    
    // Test 3: Verify the configured phone number exists
    const configuredNumber = process.env.TWILIO_PHONE_NUMBER;
    const numberExists = phoneNumbers.find(num => num.phoneNumber === configuredNumber);
    
    if (numberExists) {
      console.log(`✓ Configured number ${configuredNumber} found and active`);
    } else {
      console.error(`✗ Configured number ${configuredNumber} not found in account`);
      console.log('Available numbers:', phoneNumbers.map(n => n.phoneNumber));
    }
    
    // Test 4: Try sending a test SMS (to a verified number if possible)
    console.log('\n=== Testing SMS Send (Dry Run) ===');
    console.log('Would send SMS with:');
    console.log('From:', configuredNumber);
    console.log('Body: Test message from OZPTides');
    
  } catch (error) {
    console.error('\n=== Twilio Test Failed ===');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    console.error('More Info:', error.moreInfo);
    console.error('Status:', error.status);
    console.error('Details:', error.details);
    
    if (error.code === 20003) {
      console.log('\n=== Error 20003 Troubleshooting ===');
      console.log('This error typically means:');
      console.log('1. Invalid Account SID or Auth Token');
      console.log('2. Account SID and Auth Token don\'t match');
      console.log('3. Account is suspended or has restrictions');
      console.log('4. Credentials have been revoked or expired');
      console.log('\nPlease verify your credentials in the Twilio Console:');
      console.log('https://console.twilio.com/');
    }
  }
}

testTwilioConnection();
