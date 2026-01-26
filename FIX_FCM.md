# 🔥 URGENT FCM FIX - DO THIS NOW

## The Problem

Your VAPID key is **INVALID**. This is causing the "push service error".

Current key (WRONG):
```
BGjISSR1GNyHIguifIvU0kF7gq6JaCGKlcH7MwYNG_Yc-dfUYCZD1SH-wbuZKrSUd6PUE9R2JHiWofmqTXhY1Ao
```

## The 5-Minute Fix

### 1. Firebase Console (2 minutes)

Visit this URL (opens your Firebase project):
```
https://console.firebase.google.com/project/wearehousex-35d78/settings/cloudmessaging
```

**On that page:**
1. Scroll down to "Web Push certificates"
2. If you see an existing key → Click **"Delete"**
3. Click **"Generate key pair"**
4. Click **"Copy"** (copies the key)

### 2. Update .env (30 seconds)

Open: `web_dashboard/.env`

Replace line 17 with your NEW key:
```env
VITE_FIREBASE_VAPID_KEY=<PASTE YOUR NEW KEY HERE>
```

### 3. Clear Browser (1 minute)

1. Press **F12** (DevTools)
2. Go to **Application** tab
3. Click **"Clear site data"**
4. Under **Service Workers** → Click **"Unregister"** for all
5. Close browser COMPLETELY

### 4. Restart Server (30 seconds)

```bash
# Stop server (Ctrl+C if running)
cd web_dashboard
npm run dev
```

### 5. Test (1 minute)

1. Open browser fresh
2. Go to `http://localhost:5173`
3. Login
4. Check console - should see: `✅ FCM: Token obtained successfully`

---

## That's It!

If you see `✅ FCM: Token obtained successfully` → **IT WORKS!**

If not, run this in browser console:
```javascript
window.fcmService.debug()
```

And share the output.

---

## Quick Links

- Firebase Console: https://console.firebase.google.com/project/wearehousex-35d78/settings/cloudmessaging
- Your .env file: `web_dashboard/.env`
- Full guide: See `FIREBASE_FCM_FIX_GUIDE.md`
