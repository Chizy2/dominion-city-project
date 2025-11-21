# Update Web App to Production

This guide will help you update your application from development to production mode.

## 🎯 Quick Steps

### 1. Update Backend Environment

```bash
cd backend
```

Create or update `.env` file with production values:

```env
NODE_ENV=production
PORT=5051

# Database (Use Session Pooler - port 6543)
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.ussoyjjlauhggwsezbhy.supabase.co:6543/postgres?pgbouncer=true

# Supabase
SUPABASE_URL=https://ussoyjjlauhggwsezbhy.supabase.co
SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]

# Frontend URL (for CORS)
FRONTEND_URL=https://dcdirect.online

# Google Maps (if using)
GOOGLE_MAPS_API_KEY=[YOUR_KEY]
```

**Important:** Replace all `[YOUR_...]` placeholders with actual values!

### 2. Update Frontend Environment

```bash
cd frontend
```

Create or update `.env.local` file with production values:

```env
NODE_ENV=production

NEXT_PUBLIC_API_URL=https://dcdirect.online/api
NEXT_PUBLIC_SUPABASE_URL=https://ussoyjjlauhggwsezbhy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=[YOUR_KEY]
```

### 3. Build Frontend for Production

```bash
cd frontend
npm run build
```

This creates an optimized production build.

### 4. Start Production Servers

**Option A: Start separately**

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

**Option B: Use root scripts**

```bash
# From project root
npm run start:prod
```

## ✅ Verification Checklist

After updating to production:

- [ ] Backend `.env` has `NODE_ENV=production`
- [ ] Frontend `.env.local` has `NODE_ENV=production`
- [ ] `NEXT_PUBLIC_API_URL=https://dcdirect.online/api` is set
- [ ] `FRONTEND_URL=https://dcdirect.online` is set in backend
- [ ] Frontend has been built (`npm run build`)
- [ ] All API keys are filled in (no placeholders)
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Test: `curl https://dcdirect.online/api/health` works
- [ ] Test: Frontend loads at `https://dcdirect.online`

## 🔍 Test Production Setup

### Test Backend API:
```bash
curl https://dcdirect.online/api/health
```

Should return:
```json
{"status":"ok","message":"Dominion City API is running"}
```

### Test Database:
```bash
curl https://dcdirect.online/api/health/db
```

### Test Frontend:
Open `https://dcdirect.online` in your browser

## 📝 Key Changes from Development

| Setting | Development | Production |
|---------|------------|------------|
| `NODE_ENV` | `development` | `production` |
| `NEXT_PUBLIC_API_URL` | `http://localhost:5051/api` | `https://dcdirect.online/api` |
| `FRONTEND_URL` | Not set | `https://dcdirect.online` |
| CORS | Allows localhost | Only allows dcdirect.online |
| Error Details | Full error messages | Generic error messages |
| Image Domains | Includes localhost | Only production domains |

## 🐛 Common Issues

### "NEXT_PUBLIC_API_URL must be set"
- Make sure `.env.local` exists in `frontend/` directory
- Verify `NEXT_PUBLIC_API_URL=https://dcdirect.online/api` is set
- Restart the frontend server after updating `.env.local`

### CORS Errors
- Verify `FRONTEND_URL=https://dcdirect.online` in backend `.env`
- Check that backend server has been restarted
- Ensure you're accessing via HTTPS (not HTTP)

### Database Connection Errors
- Verify `DATABASE_URL` uses Session Pooler (port 6543)
- Check if Supabase project is paused (resume in dashboard)
- Ensure database password is correct

## 📚 Additional Resources

- `PRODUCTION_SETUP.md` - Detailed production setup guide
- `VPS_DEPLOYMENT_CONFIG.md` - VPS deployment instructions
- `ENV_PRODUCTION.md` - Complete environment variable reference

