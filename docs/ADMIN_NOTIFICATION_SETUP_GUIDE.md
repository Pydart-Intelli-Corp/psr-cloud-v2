# Admin Guide: Setting Up Notification Services

## Overview
Configure WhatsApp and SMS notifications for your farmers to receive payment updates automatically. Each admin can use their own notification service provider accounts.

---

## WhatsApp Notifications (via Twilio)

### Step 1: Create Twilio Account
1. Visit [Twilio.com](https://www.twilio.com)
2. Sign up for a free account (or use existing)
3. Verify your email and phone number

### Step 2: Get WhatsApp Sandbox Access
1. Go to Twilio Console → Messaging → Try it out → Send a WhatsApp message
2. Follow instructions to join sandbox (send code to Twilio number)
3. Note your sandbox WhatsApp number (e.g., `whatsapp:+14155238886`)

### Step 3: Get API Credentials
1. Go to Account Dashboard
2. Copy **Account SID** (this is your API Key)
3. Copy **Auth Token** (this is your API Secret)
4. Note API URL: `https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json`
   - Replace `YOUR_ACCOUNT_SID` with your actual Account SID

### Step 4: Configure in PSR Cloud
1. Log in to PSR Cloud as Admin
2. Navigate to **Payment Settings**
3. Enable **WhatsApp Notifications** toggle
4. Fill in the fields:
   - **WhatsApp API Key:** Your Account SID
   - **WhatsApp API URL:** `https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json`
   - **WhatsApp From Number:** Your sandbox number (e.g., `whatsapp:+14155238886`)
5. Click **Save Settings**

### Step 5: Test
1. Process a test payment to a farmer
2. Farmer should receive WhatsApp message
3. If not received, check Twilio Console → Logs for errors

---

## SMS Notifications

### Option 1: Twilio SMS (Global)

#### Get Credentials:
1. Same Twilio account as WhatsApp
2. Go to Phone Numbers → Buy a number (or use trial number)
3. Note your phone number (e.g., `+1234567890`)

#### Configure:
- **SMS Provider:** Twilio
- **SMS API Key:** Your Account SID
- **SMS API Secret:** Your Auth Token
- **SMS API URL:** `https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json`
- **SMS From Number:** Your Twilio phone number

---

### Option 2: MSG91 (India)

#### Get Credentials:
1. Visit [MSG91.com](https://msg91.com)
2. Sign up for account
3. Verify your business details (for sender ID approval)
4. Go to API → Get your **Auth Key**
5. Create a **Sender ID** (e.g., `PSREQP`)

#### Configure:
- **SMS Provider:** MSG91 (India)
- **SMS API Key:** Your Auth Key
- **SMS API Secret:** (Leave empty - not required)
- **SMS API URL:** `https://api.msg91.com/api/v5/flow/`
- **SMS From Number:** Your Sender ID (e.g., `PSREQP`)

#### Notes:
- MSG91 requires DLT template registration in India
- Sender ID must be approved before use
- Better delivery rates in India compared to international providers

---

### Option 3: TextLocal (UK/India)

#### Get Credentials:
1. Visit [TextLocal.com](https://www.textlocal.in) (India) or [TextLocal.co.uk](https://www.textlocal.com) (UK)
2. Sign up for account
3. Go to Settings → API Keys
4. Create new **API Key**
5. Get your **Sender ID** (registered sender name)

#### Configure:
- **SMS Provider:** TextLocal (UK/India)
- **SMS API Key:** Your API Key
- **SMS API Secret:** (Leave empty - not required)
- **SMS API URL:** `https://api.textlocal.in/send/` (India) or `https://api.txtlocal.com/send/` (UK)
- **SMS From Number:** Your Sender ID (e.g., `PSREQP`)

#### Notes:
- India: Requires DLT registration
- UK: Sender ID must be registered
- Good local delivery rates

---

## Configuration UI Guide

### Access Payment Settings:
1. Log in as **Admin**
2. Click **Payment Settings** in sidebar
3. Scroll to **Notifications** section

### WhatsApp Section:
```
☑️ WhatsApp Notifications
   ↓ (Expands when enabled)
   WhatsApp API Key: ••••••••••••• (password field)
   WhatsApp API URL: https://api.twilio.com/2010-04-01/...
   WhatsApp From Number: whatsapp:+14155238886
```

### SMS Section:
```
☑️ SMS Notifications
   ↓ (Expands when enabled)
   SMS Provider: [Twilio ▼] (dropdown)
   SMS API Key: ••••••••••••• (password field)
   SMS API Secret: ••••••••••••• (password field)
   SMS API URL: https://api.twilio.com/2010-04-01/...
   SMS From Number: +1234567890
```

### Save Changes:
- Click **Save Settings** button at bottom
- Green checkmark appears on success
- Credentials saved to your admin schema

---

## Testing Notifications

### Test WhatsApp:
1. Enable WhatsApp Notifications
2. Configure credentials (see above)
3. Go to **Payment Transactions**
4. Click **New Payment**
5. Select a farmer with valid phone number
6. Enter test amount (e.g., ₹100)
7. Select payment method
8. Submit payment
9. Check farmer's WhatsApp for message

### Test SMS:
1. Enable SMS Notifications
2. Configure credentials (see above)
3. Follow same steps as WhatsApp test
4. Check farmer's SMS inbox for message

### Check Logs:
- **Twilio Console:** Logs → Messaging Logs
- **MSG91 Dashboard:** Reports → SMS Logs
- **TextLocal Dashboard:** History → SMS History

---

## Notification Message Format

### Payment Success:
```
Hi [Farmer Name],

Payment of ₹[Amount] received successfully!

Transaction ID: [TXN_ID]
Date: [DD-MM-YYYY]

Thank you for your business.
- Poornasree Equipments
```

### Payment Pending:
```
Hi [Farmer Name],

Your payment of ₹[Amount] is being processed.

Transaction ID: [TXN_ID]

You will receive confirmation shortly.
- Poornasree Equipments
```

### Payment Failed:
```
Hi [Farmer Name],

Your payment of ₹[Amount] could not be processed.

Transaction ID: [TXN_ID]

Please contact support or try again.
- Poornasree Equipments
```

---

## Troubleshooting

### WhatsApp Messages Not Sent:

**Issue:** Farmer not receiving WhatsApp
**Solutions:**
1. Check farmer's phone number format (+91XXXXXXXXXX)
2. Verify farmer joined Twilio sandbox (for testing)
3. Check Twilio Console → Logs for errors
4. Ensure API URL includes your Account SID
5. Verify API Key (Account SID) is correct
6. Check Twilio account balance (if using paid account)

---

### SMS Messages Not Sent:

**Issue:** Farmer not receiving SMS
**Solutions:**
1. Check phone number format (10 digits for India)
2. Verify sender ID is approved (MSG91/TextLocal)
3. Check provider dashboard logs
4. Ensure API credentials are correct
5. Verify provider account has credits
6. For India: Check DLT template registration

---

### Invalid Credentials Error:

**Issue:** "WhatsApp API key not configured" or "SMS API key not configured"
**Solutions:**
1. Ensure you clicked **Save Settings** after entering credentials
2. Check that toggle is enabled (WhatsApp Notifications / SMS Notifications)
3. Verify API Key field is not empty
4. Re-enter credentials and save again
5. Check browser console for errors

---

### Messages Send to Wrong Number:

**Issue:** Notifications going to wrong farmer
**Solutions:**
1. Check farmer's phone number in Farmer Management
2. Update farmer's phone number if incorrect
3. Verify farmer's paytm_phone field (used as fallback)
4. Process payment again after updating

---

## Best Practices

### Production Setup:
1. **Twilio:** Upgrade to paid account, buy dedicated number
2. **MSG91:** Complete DLT registration, get sender ID approved
3. **TextLocal:** Register sender ID, verify business
4. **All Providers:** Add sufficient credits/balance

### Security:
1. Never share API credentials
2. Use strong API keys (don't use test keys in production)
3. Rotate API keys periodically
4. Monitor usage in provider dashboard

### Cost Management:
1. Check per-message costs for your region
2. Monitor monthly usage
3. Set up billing alerts in provider dashboard
4. Consider bulk credits for discounts

### Compliance:
1. **India:** Register DLT templates (mandatory)
2. **Global:** Follow local SMS/WhatsApp regulations
3. Include opt-out mechanism if required
4. Don't send promotional messages (only transactional)

---

## Support

### Provider Support:
- **Twilio:** [support.twilio.com](https://support.twilio.com)
- **MSG91:** [help.msg91.com](https://help.msg91.com)
- **TextLocal:** [support.textlocal.com](https://www.textlocal.com/support/)

### PSR Cloud Support:
- Contact your system administrator
- Check logs in browser console (F12)
- Review Payment Settings configuration
- Verify farmer phone numbers are correct

---

## FAQs

**Q: Can I use different providers for different admins?**
A: Yes! Each admin configures their own credentials independently.

**Q: What happens if I don't configure credentials?**
A: Notifications will be skipped (payments still work).

**Q: Can I use the same Twilio account for WhatsApp and SMS?**
A: Yes, same Account SID can be used for both.

**Q: Do I need to configure both WhatsApp and SMS?**
A: No, you can enable just one or both based on your needs.

**Q: Are test credentials safe in production?**
A: No, use production credentials only. Test/sandbox has limitations.

**Q: How do I know if a message was delivered?**
A: Check provider dashboard logs (Twilio/MSG91/TextLocal).

**Q: Can farmers reply to notifications?**
A: Depends on provider setup (two-way SMS requires configuration).

**Q: What's the cost per message?**
A: Check your provider's pricing page (varies by region and provider).

---

## Quick Start Checklist

- [ ] Create provider account (Twilio/MSG91/TextLocal)
- [ ] Get API credentials (Key, Secret, URL)
- [ ] Get sender number/ID
- [ ] Log in to PSR Cloud as Admin
- [ ] Go to Payment Settings
- [ ] Enable WhatsApp/SMS Notifications
- [ ] Enter credentials
- [ ] Save Settings
- [ ] Process test payment
- [ ] Verify farmer receives notification
- [ ] Check provider logs for success
- [ ] Add credits for production use

---

**Last Updated:** January 28, 2026
**Version:** 1.0
