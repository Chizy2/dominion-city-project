 # 🚀 Quick cPanel Deployment Reference

## ⚡ Fast Track Deployment

### 1. Backend (5 minutes)

```bash
# In cPanel Node.js App Manager:
1. Create Application
   - Root: nodejs/backend
   - URL: dcdirect.online/api
   - Startup: server.js
   - Node: 18.x or 20.x

2. Environment Variables:
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.ussoyjjlauhggwsezbhy.supabase.co:6543/postgres?pgbouncer=true
   JWT_SECRET=[generate with: openssl rand -base64 32]
   JWT_EXPIRE=7d
   SUPABASE_URL=https://ussoyjjlauhggwsezbhy.supabase.co
   SUPABASE_ANON_KEY=[from Supabase Dashboard]
   SUPABASE_SERVICE_ROLE_KEY=[from Supabase Dashboard]
   FRONTEND_URL=https://dcdirect.online

3. Run NPM Install → Start App
```

### 2. Frontend (5 minutes)

```bash
# Local first:
cd frontend
npm install
npm run build

# Then in cPanel:
1. Upload frontend/ folder to public_html/

2. Create Application
   - Root: public_html
   - URL: dcdirect.online
   - Startup: server.js
   - Node: 18.x or 20.x

3. Environment Variables:
   NODE_ENV=production
   PORT=3000
   NEXT_PUBLIC_API_URL=https://dcdirect.online/api
   NEXT_PUBLIC_SUPABASE_URL=https://ussoyjjlauhggwsezbhy.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[from Supabase Dashboard]
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=[your key]

4. Run NPM Install → Start App
```

### 3. Test

```bash
# Backend
curl https://dcdirect.online/api/health

# Frontend
Open https://dcdirect.online in browser
```

---

## 📋 Key Files

- `CPANEL_DEPLOYMENT.md` - Full deployment guide
- `ENV_PRODUCTION.md` - All environment variables
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist

---

## 🔑 Quick Get Values

**Supabase Connection String:**
- Dashboard → Project Settings → Database → Connection Pooling → Session mode
- Use port **6543** (Session Pooler)

**Supabase Keys:**
- Dashboard → Project Settings → API
- Copy `anon/public` and `service_role` keys

**JWT Secret:**
```bash
openssl rand -base64 32
```

---

## ⚠️ Common Issues

1. **Connection timeout** → Use Session Pooler (port 6543)
2. **CORS errors** → Check FRONTEND_URL matches your domain
3. **Module not found** → Run NPM Install in cPanel
4. **Build fails** → Check Node.js version (18.x or 20.x)

---

## 📞 Full Docs

See `CPANEL_DEPLOYMENT.md` for complete instructions.


