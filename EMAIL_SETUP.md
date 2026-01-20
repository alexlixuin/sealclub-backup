# Email Setup Guide for Crypto Payment Notifications

This guide explains how to configure email credentials for the crypto payment notification system.

## Gmail App Password Setup

The crypto payment notification feature uses Gmail to send email alerts when customers indicate they've made a cryptocurrency payment. Follow these steps to set up the required credentials:

### Step 1: Enable 2-Factor Authentication

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click on "2-Step Verification"
3. Follow the prompts to enable 2FA if not already enabled
4. **Note:** App Passwords require 2FA to be enabled

### Step 2: Generate an App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click on "2-Step Verification"
3. Scroll down and click on "App passwords"
4. You may need to sign in again
5. Click "Select app" and choose "Mail"
6. Click "Select device" and choose "Other (Custom name)"
7. Enter a name like "OzPtides Crypto Notifications"
8. Click "Generate"
9. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Update Environment Variables

1. Open the `.env.local` file in your project root
2. Update the following variables:

```env
# Email Configuration for Nodemailer
EMAIL_USER=your-actual-gmail@gmail.com
EMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

Replace:
- `your-actual-gmail@gmail.com` with your Gmail address
- `abcd efgh ijkl mnop` with the app password you generated

### Step 4: Restart the Development Server

After updating the environment variables:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

## Testing the Setup

1. Go to the checkout page
2. Select "Alternative Payment Models" 
3. Generate an order number
4. Click "I've Paid" in the crypto section
5. Check if you receive an email notification at `aaravknz@gmail.com`

## Troubleshooting

### Common Issues:

**"Missing credentials for PLAIN" Error:**
- Ensure both `EMAIL_USER` and `EMAIL_APP_PASSWORD` are set in `.env.local`
- Restart the development server after updating environment variables

**"Invalid login" Error:**
- Double-check the Gmail address is correct
- Verify the app password was copied correctly (no extra spaces)
- Ensure 2FA is enabled on your Google account

**Email not received:**
- Check spam/junk folder
- Verify the recipient email (`aaravknz@gmail.com`) is correct
- Check server logs for any error messages

### Alternative Email Services

If you prefer not to use Gmail, you can modify the transporter configuration in `/app/api/crypto-payment-notification/route.ts`:

```javascript
// For Outlook/Hotmail
const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
})

// For custom SMTP
const transporter = nodemailer.createTransport({
  host: 'your-smtp-server.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
})
```

## Security Notes

- **Never commit** your actual email credentials to version control
- The `.env.local` file is already in `.gitignore` to prevent accidental commits
- App passwords are safer than using your main Gmail password
- You can revoke app passwords anytime from your Google Account settings

## Optional: Disable Email Notifications

If you don't want to set up email notifications, the system will work fine without them. The crypto payment feature will:
- Still function normally
- Show success messages to users
- Log a message that email notifications are skipped
- Not crash or show errors to customers
