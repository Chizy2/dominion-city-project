# PM2 Port 5050 Error - Fix Instructions

## 🔴 Problem

Your PM2 process is trying to use port **5050** (old port) but:
1. Port 5050 is already in use
2. Environment is set to "development" instead of "production"
3. Should be using port **5051** for production

## ✅ Solution

### Step 1: Stop Current PM2 Process

```bash
# Stop the current backend process
pm2 stop dominion-backend

# Or stop all processes
pm2 stop all

# Delete the old process
pm2 delete dominion-backend
```

### Step 2: Check What's Using Port 5050

```bash
# Find what's using port 5050
sudo lsof -i :5050
# or
sudo netstat -tulpn | grep 5050

# Kill the process if needed
sudo kill -9 <PID>
```

### Step 3: Update Your Backend .env File

Make sure `backend/.env` has:

```env
NODE_ENV=production
PORT=5051

# Your other production variables...
DATABASE_URL=...
SUPABASE_URL=...
FRONTEND_URL=https://dcdirect.online
```

### Step 4: Use PM2 Ecosystem Config (Recommended)

**Option A: Use the ecosystem.config.js file**

1. Update the `cwd` path in `ecosystem.config.js` to your actual project path
2. Add your environment variables to the config file
3. Start with ecosystem config:

```bash
pm2 start ecosystem.config.js
```

**Option B: Start with environment variables**

```bash
cd /path/to/your/project/backend
pm2 start server.js --name dominion-backend \
  --env production \
  --update-env \
  -e ../logs/backend-error.log \
  -o ../logs/backend-out.log \
  -- \
  NODE_ENV=production PORT=5051
```

### Step 5: Verify It's Working

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs dominion-backend --lines 20

# You should see:
# 🚀 Server running on 0.0.0.0:5051
# 📡 Environment: production (PRODUCTION)
# 🔗 API available at: https://dcdirect.online/api
```

### Step 6: Save PM2 Configuration

```bash
# Save current PM2 process list
pm2 save

# Setup PM2 to start on server reboot
pm2 startup
# Follow the instructions it gives you
```

## 🔍 Quick Fix Commands

If you just want to quickly fix it:

```bash
# 1. Stop and delete old process
pm2 delete dominion-backend

# 2. Kill anything on port 5050
sudo lsof -ti:5050 | xargs sudo kill -9

# 3. Start with correct port (from backend directory)
cd /path/to/backend
PORT=5051 NODE_ENV=production pm2 start server.js --name dominion-backend

# 4. Save
pm2 save
```

## 📝 Environment Variables Setup

Make sure your `backend/.env` file has:

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

## ⚠️ Important Notes

1. **Port 5051** is the new default (not 5050)
2. **NODE_ENV=production** must be set for production mode
3. PM2 will use environment variables from `.env` file if you're in the backend directory
4. Or set them in the PM2 ecosystem config file

## 🐛 Troubleshooting

### Still seeing port 5050?

```bash
# Check PM2 environment
pm2 env 0

# Check what port the process is actually using
pm2 describe dominion-backend
```

### Environment still showing "development"?

Make sure:
1. `.env` file has `NODE_ENV=production`
2. PM2 is reading the `.env` file (start from backend directory)
3. Or set it explicitly: `NODE_ENV=production pm2 start ...`

### Port still in use?

```bash
# Find and kill the process
sudo lsof -ti:5050 | xargs sudo kill -9
sudo lsof -ti:5051 | xargs sudo kill -9

# Then restart PM2
pm2 restart dominion-backend
```

