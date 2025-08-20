# VAPID Keys Configuration Guide

## 🔑 Current VAPID Keys (Generated: 2025-01-20)

### Production Keys
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BK2b5isMYthQDclh-57Cwi7NH9o_7EbCzBgQGagv92eqxoRfMfehBwGONB0dReWJjalPIre7SW7Llr6L27RrvfE
VAPID_PRIVATE_KEY=WKYqEu_91REP9jXEmIa6bo0wNfR5auPMX2jlBHZGAZA
VAPID_EMAIL=mailto:unvisr@gmail.com
```

## ⚠️ IMPORTANT NOTES

1. **VAPID_EMAIL Format**: Must include `mailto:` protocol
   - ✅ Correct: `mailto:unvisr@gmail.com`
   - ❌ Wrong: `unvisr@gmail.com`

2. **Key Pair Consistency**: Public and Private keys MUST be from the same pair
   - If you regenerate, update BOTH keys everywhere

3. **Service Role Key**: Required for bypassing RLS in production
   - Get from: Supabase Dashboard > Settings > API > Service Role Key

## 📝 Vercel Environment Variables Setup

### Required Variables
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings > Environment Variables
4. Add these variables:

```bash
# Public Variables (exposed to client)
NEXT_PUBLIC_SUPABASE_URL=https://ihgojwljhbdrfmqhlspb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[Your Anon Key]
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BK2b5isMYthQDclh-57Cwi7NH9o_7EbCzBgQGagv92eqxoRfMfehBwGONB0dReWJjalPIre7SW7Llr6L27RrvfE

# Server-only Variables (keep secret!)
SUPABASE_SERVICE_ROLE_KEY=[Your Service Role Key]
VAPID_PRIVATE_KEY=WKYqEu_91REP9jXEmIa6bo0wNfR5auPMX2jlBHZGAZA
VAPID_EMAIL=mailto:unvisr@gmail.com
```

## 🔄 After Changing VAPID Keys

If you change VAPID keys:

1. **Update everywhere**:
   - Local `.env.local`
   - Vercel Environment Variables
   - Any cached Service Workers

2. **Clear old subscriptions**:
   - Old subscriptions won't work with new keys
   - Run this SQL in Supabase:
   ```sql
   UPDATE push_subscriptions 
   SET is_active = false 
   WHERE created_at < NOW();
   ```

3. **Re-deploy**:
   - Trigger new deployment in Vercel
   - Clear browser cache/Service Workers
   - Re-subscribe to notifications

## 🧪 Testing Push Notifications

### Local Testing
```bash
# 1. Start dev server
npm run dev

# 2. Subscribe to notifications
# Visit http://localhost:3000 and click "알림 받기"

# 3. Send test notification
# Go to http://localhost:3000/admin/notifications
```

### Production Testing
1. Visit your deployed site
2. Subscribe to notifications (click "알림 받기")
3. Go to `/admin/notifications`
4. Send test notification
5. Check browser console for errors

## 🐛 Troubleshooting

### "Failed to send notification" errors
1. Check VAPID_EMAIL has `mailto:` prefix
2. Verify Public/Private keys are from same pair
3. Check Service Role Key is set in Vercel
4. Ensure subscriptions are recent (not expired)

### "No active subscriptions" 
1. Re-subscribe on the main site
2. Check RLS policies allow reading subscriptions
3. Verify Service Role Key is configured

### Server logs to check
- Vercel Functions logs
- Browser DevTools console
- Network tab for API responses

## 📚 References
- [Web Push Protocol](https://developers.google.com/web/fundamentals/push-notifications)
- [VAPID Specification](https://tools.ietf.org/html/rfc8292)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)