# SMS Coupon System Setup Guide

This guide will help you configure the SMS coupon subscription system for your OZPTides ecommerce store.

## Prerequisites

- Twilio account (free trial available)
- Node.js environment variables setup
- npm package installation

## 1. Twilio Account Setup

### Create Twilio Account
1. Go to [https://www.twilio.com/](https://www.twilio.com/)
2. Sign up for a free account
3. Complete phone number verification
4. Navigate to the Twilio Console Dashboard

### Get Your Credentials
From your Twilio Console Dashboard, collect the following:

1. **Account SID**: Found on the main dashboard
2. **Auth Token**: Found on the main dashboard (click "Show" to reveal)
3. **Phone Number**: You'll need to get a Twilio phone number

### Get a Twilio Phone Number
1. In Twilio Console, go to **Phone Numbers** > **Manage** > **Buy a number**
2. Choose your country (Australia recommended for AU business)
3. Select a number with SMS capabilities
4. Purchase the number (free trial credits can be used)

## 2. Database Setup

First, run the SQL schema in your Supabase database:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `sms-schema.sql`
4. Click **Run** to create the tables and functions

This will create:
- `sms_verifications` - Stores verification codes
- `sms_discount_codes` - Stores generated discount codes  
- `sms_rate_limits` - Handles rate limiting
- Cleanup functions and indexes

## 3. Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
```

### Example `.env.local` file:
```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcdef
TWILIO_AUTH_TOKEN=your_auth_token_1234567890abcdef12
TWILIO_PHONE_NUMBER=+61412345678

# Your existing environment variables...
NEXT_PUBLIC_SITE_URL=https://ozptides.com
STRIPE_PUBLISHABLE_KEY=pk_test_...
# etc.
```

## 3. Install Dependencies

The Twilio package has been added to your `package.json`. Install it by running:

```bash
npm install
```

This will install:
- `twilio@^5.3.5` - Official Twilio SDK for Node.js

## 4. Testing the SMS System

### Test in Development
1. Start your development server: `npm run dev`
2. Visit your homepage
3. The SMS popup should appear after 2 seconds
4. Test with your own phone number (include country code)

### Twilio Trial Limitations
- **Free Trial**: $15.50 in free credits
- **Verified Numbers Only**: Can only send SMS to verified phone numbers
- **SMS Cost**: ~$0.0075 per SMS in Australia
- **Rate Limits**: 1 SMS per second by default

### Verify Additional Phone Numbers (Trial)
1. Go to Twilio Console > **Phone Numbers** > **Manage** > **Verified Caller IDs**
2. Click **Add a new number**
3. Enter the phone number you want to test
4. Complete the verification process

## 5. Production Considerations

### Upgrade Twilio Account
For production use:
1. Add billing information to your Twilio account
2. This removes the verified numbers restriction
3. Enables sending to any valid phone number

### Security Best Practices
- ✅ Environment variables are properly configured
- ✅ Rate limiting is implemented (3 attempts per hour per phone)
- ✅ Verification codes expire after 5 minutes
- ✅ Discount codes expire after 10 minutes
- ✅ Phone number validation is enforced

### Monitoring & Analytics
- Monitor SMS delivery rates in Twilio Console
- Track conversion rates from SMS popup to purchases
- Monitor for abuse or spam attempts

## 6. Customization Options

### SMS Message Template
Edit the message in `/app/api/sms/send/route.ts`:
```typescript
body: `Your OZPTides verification code is: ${code}. Valid for 5 minutes.`
```

### Discount Configuration
Modify discount settings in `/app/api/sms/verify/route.ts`:
- Change discount percentage (currently 10%)
- Adjust expiry time (currently 10 minutes)
- Modify code format (currently "SMS10-XXXX")

### Rate Limiting
Adjust rate limits in `/app/api/sms/send/route.ts`:
- Change attempts per hour (currently 3)
- Modify time window (currently 1 hour)

## 7. Troubleshooting

### Common Issues

**SMS not sending:**
- Check Twilio credentials in `.env.local`
- Verify phone number format includes country code
- Check Twilio Console logs for delivery status

**"Invalid phone number" error:**
- Ensure format is +[country_code][number] (e.g., +61412345678)
- Remove spaces, dashes, or parentheses

**Rate limiting issues:**
- Wait 1 hour between attempts for same phone number
- Check browser console for specific error messages

**Popup not appearing:**
- Clear localStorage: `localStorage.clear()`
- Check browser console for JavaScript errors
- Ensure popup hasn't been dismissed or completed

### Support Resources
- [Twilio SMS Documentation](https://www.twilio.com/docs/sms)
- [Twilio Console](https://console.twilio.com/)
- [Twilio Support](https://support.twilio.com/)

## 8. Cost Estimation

### SMS Costs (Australia)
- **Outbound SMS**: ~$0.0075 AUD per message
- **Phone Number**: ~$1.50 AUD per month
- **100 SMS/month**: ~$2.25 AUD total

### ROI Calculation
- If 10% of SMS recipients make a purchase
- Average order value: $200 AUD
- 100 SMS → 10 orders → $2,000 revenue
- Cost: $2.25, Revenue: $2,000
- ROI: 88,789% 🚀

---

## Quick Start Checklist

- [ ] Create Twilio account
- [ ] Get Account SID, Auth Token, and Phone Number
- [ ] Add environment variables to `.env.local`
- [ ] Run `npm install`
- [ ] Test SMS popup on homepage
- [ ] Verify SMS delivery to your phone
- [ ] Test discount code generation and cart integration

Your SMS coupon system is now ready to boost conversions! 📱💰
