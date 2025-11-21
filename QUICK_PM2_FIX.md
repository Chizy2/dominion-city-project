# Quick PM2 Port Fix - Run on Your VPS

## 🚨 The Problem

PM2 is trying to use port **5050** (old port) but it should use **5051**. Also, something is already using port 5050.

## ✅ Quick Fix (Run on Your VPS)

### Option 1: Use the Fix Script

```bash
# Upload fix-pm2-port.sh to your VPS, then:
chmod +x fix-pm2-port.sh
./fix-pm2-port.sh
```

### Option 2: Manual Fix (Copy & Paste)

Run these commands **on your VPS**:

```bash
# 1. Stop and delete old PM2 process
pm2 stop dominion-backend
pm2 delete dominion-backend

# 2. Kill anything on port 5050
sudo lsof -ti:5050 | xargs sudo kill -9

# 3. Navigate to backend directory
cd /var/www/dominion-city-project/backend
# OR wherever your backend is located

# 4. Make sure .env has correct values
# Edit .env file and ensure:
# PORT=5051
# NODE_ENV=production

# 5. Start PM2 with correct port
PORT=5051 NODE_ENV=production pm2 start server.js --name dominion-backend --update-env

# 6. Save PM2 config
pm2 save

# 7. Check it's working
pm2 logs dominion-backend --lines 10
```

You should see:
```
🚀 Server running on 0.0.0.0:5051
📡 Environment: production (PRODUCTION)
🔗 API available at: https://dcdirect.online/api
```

## 📝 Update Your Backend .env File

Make sure `/var/www/dominion-city-project/backend/.env` has:

```env
NODE_ENV=production
PORT=5051

DATABASE_URL=postgresql://postgres:[PASSWORD]@db.ussoyjjlauhggwsezbhy.supabase.co:6543/postgres?pgbouncer=true
SUPABASE_URL=https://ussoyjjlauhggwsezbhy.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
FRONTEND_URL=https://dcdirect.online
GOOGLE_MAPS_API_KEY=your_key
```

## 🔍 Verify It's Fixed

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs dominion-backend --lines 20

# Test the API
curl http://localhost:5051/api/health
```

## ⚠️ Important

- Make sure you're running these commands **on your VPS**, not locally
- Update the path `/var/www/dominion-city-project` to match your actual project path
- The `.env` file must have `PORT=5051` (not 5050)

