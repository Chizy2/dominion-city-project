# Check Frontend Production Status

## 🔍 How to Check if Frontend is in Production

Run these commands **on your VPS**:

```bash
# 1. Check PM2 status
pm2 status

# 2. Check frontend logs
pm2 logs dominion-frontend --lines 20

# 3. Check if .next build folder exists
ls -la /var/www/dominion-city-project/frontend/.next

# 4. Check environment variables
pm2 env 1  # Replace 1 with your frontend process ID
```

## ✅ What You Should See if Frontend is in Production

### PM2 Logs Should Show:
```
🚀 Frontend running on 0.0.0.0:3000
📡 Environment: production
🌐 Access at: http://0.0.0.0:3000
```

### PM2 Status Should Show:
- Name: `dominion-frontend`
- Status: `online`
- Mode: `fork`
- Restarts: low number

### Build Folder Should Exist:
- `/var/www/dominion-city-project/frontend/.next` directory should exist
- Should contain `server.js`, `static/`, etc.

## ❌ Common Issues

### Issue 1: Frontend Not Built
**Symptom:** No `.next` folder or build errors

**Fix:**
```bash
cd /var/www/dominion-city-project/frontend
npm run build
```

### Issue 2: Environment Shows "development"
**Symptom:** Logs show `Environment: development`

**Fix:**
```bash
# Stop frontend
pm2 stop dominion-frontend
pm2 delete dominion-frontend

# Start with production environment
cd /var/www/dominion-city-project/frontend
NODE_ENV=production pm2 start server.js --name dominion-frontend

# Or use ecosystem config
pm2 start ecosystem.config.js --only dominion-frontend
```

### Issue 3: Missing Environment Variables
**Symptom:** API calls fail or wrong API URL

**Fix:**
Create or update `frontend/.env.local`:
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://dcdirect.online/api
NEXT_PUBLIC_SUPABASE_URL=https://ussoyjjlauhggwsezbhy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
```

Then restart:
```bash
pm2 restart dominion-frontend
```

## 📋 Production Checklist

- [ ] Frontend has been built (`npm run build` completed successfully)
- [ ] `.next` folder exists in frontend directory
- [ ] PM2 shows `NODE_ENV=production` for frontend process
- [ ] Logs show `Environment: production`
- [ ] `frontend/.env.local` exists with production variables
- [ ] `NEXT_PUBLIC_API_URL=https://dcdirect.online/api` is set
- [ ] Frontend is accessible at `https://dcdirect.online`
- [ ] No build errors in PM2 logs

## 🚀 Quick Production Setup

If frontend is NOT in production, run:

```bash
# 1. Navigate to frontend
cd /var/www/dominion-city-project/frontend

# 2. Install dependencies (if needed)
npm install

# 3. Create/update .env.local
cat > .env.local << EOF
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://dcdirect.online/api
NEXT_PUBLIC_SUPABASE_URL=https://ussoyjjlauhggwsezbhy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_key
EOF

# 4. Build for production
npm run build

# 5. Stop old PM2 process (if exists)
pm2 stop dominion-frontend 2>/dev/null
pm2 delete dominion-frontend 2>/dev/null

# 6. Start with PM2
NODE_ENV=production pm2 start server.js --name dominion-frontend

# 7. Save PM2 config
pm2 save

# 8. Check logs
pm2 logs dominion-frontend --lines 10
```

## 🔍 Verify Production Mode

After setup, verify:

```bash
# Check environment
pm2 logs dominion-frontend | grep "Environment"

# Should show: 📡 Environment: production

# Test the site
curl -I https://dcdirect.online

# Should return HTTP 200
```

