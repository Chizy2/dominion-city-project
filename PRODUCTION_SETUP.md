# Production Setup Guide

This guide will help you transition your application from development to production.

## 🚀 Quick Production Setup

### Step 1: Backend Production Configuration

1. **Copy production environment template:**
   ```bash
   cd backend
   cp .env.production .env
   ```

2. **Edit `.env` file** and fill in your actual values:
   - Replace `[PASSWORD]` in `DATABASE_URL` with your Supabase database password
   - Replace `your_supabase_anon_key_here` with your actual Supabase anon key
   - Replace `your_service_role_key_here` with your actual Supabase service role key
   - Replace `your_google_maps_api_key_here` with your Google Maps API key (if using)

3. **Verify `NODE_ENV=production`** is set in `.env`

### Step 2: Frontend Production Configuration

1. **Copy production environment template:**
   ```bash
   cd frontend
   cp .env.production .env.local
   ```

2. **Edit `.env.local` file** and fill in your actual values:
   - Replace `your_supabase_anon_key_here` with your actual Supabase anon key
   - Replace `your_google_maps_api_key_here` with your Google Maps API key (if using)

3. **Verify `NEXT_PUBLIC_API_URL=https://dcdirect.online/api`** is set correctly

### Step 3: Build Frontend for Production

```bash
cd frontend
npm install
npm run build
```

This creates an optimized production build in the `.next` folder.

### Step 4: Start Production Servers

**Backend:**
```bash
cd backend
npm install
npm start
```

**Frontend:**
```bash
cd frontend
npm start
```

## ✅ Production Checklist

- [ ] Backend `.env` file has `NODE_ENV=production`
- [ ] Backend `.env` has correct `DATABASE_URL` (Session Pooler port 6543)
- [ ] Backend `.env` has `FRONTEND_URL=https://dcdirect.online`
- [ ] Frontend `.env.local` has `NEXT_PUBLIC_API_URL=https://dcdirect.online/api`
- [ ] Frontend has been built with `npm run build`
- [ ] All Supabase keys are set correctly
- [ ] Google Maps API key is set (if using maps)
- [ ] SSL/HTTPS is configured on your VPS
- [ ] DNS points `dcdirect.online` to your VPS IP
- [ ] Reverse proxy (nginx/Apache) is configured

## 🔍 Verify Production Setup

### Test Backend:
```bash
curl https://dcdirect.online/api/health
```

Expected response:
```json
{"status":"ok","message":"Dominion City API is running"}
```

### Test Database Connection:
```bash
curl https://dcdirect.online/api/health/db
```

### Test Frontend:
Open `https://dcdirect.online` in your browser

## 🔒 Security Notes

1. **Never commit `.env` or `.env.local` files** to version control
2. **Use HTTPS only** in production
3. **Keep `SUPABASE_SERVICE_ROLE_KEY` secret** - it has admin access
4. **Use Session Pooler** (port 6543) for database connections
5. **Set strong passwords** for all services

## 📝 Environment Variables Summary

### Backend Required:
- `NODE_ENV=production`
- `PORT=5051`
- `DATABASE_URL` (Supabase Session Pooler)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FRONTEND_URL=https://dcdirect.online`

### Frontend Required:
- `NODE_ENV=production`
- `NEXT_PUBLIC_API_URL=https://dcdirect.online/api`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🐛 Troubleshooting

### "Connection timeout" errors
- Check if Supabase project is paused
- Use Session Pooler connection string (port 6543)
- Verify `DATABASE_URL` is correct

### CORS errors
- Verify `FRONTEND_URL=https://dcdirect.online` in backend `.env`
- Check backend CORS configuration in `backend/server.js`
- Ensure URLs use HTTPS in production

### Frontend not connecting to backend
- Verify `NEXT_PUBLIC_API_URL=https://dcdirect.online/api` in frontend `.env.local`
- Check that backend is running and accessible
- Verify SSL certificates are valid

## 📚 Additional Resources

- `VPS_DEPLOYMENT_CONFIG.md` - VPS-specific deployment guide
- `ENV_PRODUCTION.md` - Detailed environment variable documentation
- `DEPLOYMENT_CHECKLIST.md` - Complete deployment checklist

