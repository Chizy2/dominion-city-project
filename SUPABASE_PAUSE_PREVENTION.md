# Why Supabase Databases Shutdown/Pause

## 🔍 Common Reasons

### 1. **Free Tier Auto-Pause (Most Common)**
- **Cause**: Supabase free tier projects automatically pause after **7 days of inactivity**
- **What happens**: Database becomes unavailable, connections timeout
- **Solution**: Keep the database active with periodic queries (see below)

### 2. **Manual Pause**
- **Cause**: Project manually paused in Supabase Dashboard
- **Solution**: Resume project from dashboard

### 3. **Resource Limits**
- **Cause**: Exceeding free tier limits (database size, bandwidth, etc.)
- **Solution**: Upgrade to Pro plan or optimize usage

### 4. **Connection Issues**
- **Cause**: Network problems, firewall, or misconfigured connection string
- **Solution**: Check connection string and network settings

## ✅ Solutions Implemented

### 1. **Keep-Alive Service** (Automatic)
A keep-alive service has been added that:
- Runs a simple query every **6 days** to prevent auto-pause
- Automatically starts when the server starts
- Only runs for Supabase projects (not local databases)
- Logs keep-alive activity for monitoring

**File**: `backend/config/keep-alive.js`

### 2. **Improved Connection Handling**
- Increased connection timeout to **60 seconds** (allows time for paused projects to wake up)
- Better error messages indicating when project is paused
- Automatic reconnection attempts

### 3. **Health Check Endpoint**
Use `/api/health/db` to check database status:
```bash
curl http://localhost:5050/api/health/db
```

## 🚀 How to Resume a Paused Project

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Find your project**: `ussoyjjlauhggwsezbhy`
3. **Click "Restore" or "Resume"** button
4. **Wait 2-5 minutes** for the database to become available
5. **Restart your backend server** if needed

## 📊 Monitoring

### Check if Database is Paused:
```bash
# Check health endpoint
curl http://localhost:5050/api/health/db

# Or check server logs for connection errors
```

### Signs of Paused Database:
- Connection timeout errors
- "Connection terminated" errors
- "Database unavailable" messages
- 503 status codes from API

## 🔧 Manual Keep-Alive (Alternative)

If you want to manually keep the database active, you can:

1. **Set up a cron job** (on your server):
```bash
# Run every 6 days
0 0 */6 * * curl http://your-domain.com/api/health/db
```

2. **Use external monitoring services**:
   - UptimeRobot (free tier)
   - Pingdom
   - StatusCake

3. **Upgrade to Pro Plan**:
   - Pro plan ($25/month) doesn't auto-pause
   - Better for production applications

## 💡 Best Practices

1. **Use Session Pooler**: Always use port 6543 connection string for better connection management
2. **Monitor Regularly**: Check Supabase dashboard weekly
3. **Set Up Alerts**: Configure alerts for connection failures
4. **Keep Server Running**: The keep-alive service only works when your server is running

## 📝 Connection String Format

**Session Pooler (Recommended)**:
```
postgresql://postgres:[PASSWORD]@db.ussoyjjlauhggwsezbhy.supabase.co:6543/postgres?pgbouncer=true
```

**Direct Connection**:
```
postgresql://postgres:[PASSWORD]@db.ussoyjjlauhggwsezbhy.supabase.co:5432/postgres
```

## ⚠️ Important Notes

- Keep-alive service runs **only when your backend server is running**
- If your server stops for more than 7 days, the database will pause
- Keep-alive queries are lightweight and don't affect performance
- Free tier has a 500MB database size limit

