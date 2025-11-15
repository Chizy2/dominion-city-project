# Using Supabase Session Pooler

## What is Session Pooler?

Supabase Session Pooler (PgBouncer) is a connection pooler that:
- ✅ Manages database connections more efficiently
- ✅ Reduces connection overhead
- ✅ Better for serverless/server applications
- ✅ Prevents connection exhaustion
- ✅ Recommended for production use

## Connection String Formats

### Direct Connection (Port 5432)
```
postgresql://postgres:[PASSWORD]@db.ussoyjjlauhggwsezbhy.supabase.co:5432/postgres
```

### Session Pooler (Port 6543) - **RECOMMENDED**
```
postgresql://postgres:[PASSWORD]@db.ussoyjjlauhggwsezbhy.supabase.co:6543/postgres
```

**OR with explicit pooler parameter:**
```
postgresql://postgres:[PASSWORD]@db.ussoyjjlauhggwsezbhy.supabase.co:6543/postgres?pgbouncer=true
```

## How to Switch to Session Pooler

### Option 1: Update DATABASE_URL in .env

Simply change the port from `5432` to `6543`:

```env
# Before (Direct Connection)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.ussoyjjlauhggwsezbhy.supabase.co:5432/postgres

# After (Session Pooler) ✅ RECOMMENDED
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.ussoyjjlauhggwsezbhy.supabase.co:6543/postgres
```

### Option 2: Get from Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Project Settings** → **Database**
4. Scroll to **Connection string** section
5. Select **Connection pooling** tab (instead of **URI**)
6. Choose **Session mode** (recommended)
7. Copy the connection string
8. Update `backend/.env` with the new `DATABASE_URL`

## Benefits of Session Pooler

### Direct Connection (5432)
- Full PostgreSQL features
- More connections available
- Higher overhead per connection
- Can exhaust connection limits quickly

### Session Pooler (6543) ✅
- **Better connection management**
- **Lower overhead**
- **Recommended for production**
- **Works great with serverless/server apps**
- Slightly limited features (some advanced PostgreSQL features not available)

## Configuration

The database config automatically detects if you're using the pooler (port 6543) and configures connection limits appropriately:

- **Pooler mode**: Max 10 connections
- **Direct mode**: Max 20 connections

## Testing

After updating your `DATABASE_URL`:

1. Restart your server
2. Check console output - it will show which connection type is being used
3. Test your API endpoints

You should see:
```
🔗 Using Supabase Session Pooler (recommended for better connection management)
✅ Connected to PostgreSQL database
```

## Troubleshooting

### "Too many connections" error
- Switch to session pooler (port 6543)
- Reduces connection count significantly

### Connection timeout
- Ensure your Supabase project is active (not paused)
- Check network connectivity

### Feature not available
- Some advanced PostgreSQL features may not work with session pooler
- Switch to direct connection (5432) if needed for specific features

## Recommendation

**Use Session Pooler (6543) for:**
- ✅ Production applications
- ✅ Serverless/server applications
- ✅ Applications with many concurrent requests
- ✅ Better connection management

**Use Direct Connection (5432) for:**
- Local development (optional)
- When you need all PostgreSQL features
- Direct database administration

## Current Setup

Your database configuration now:
- ✅ Automatically detects pooler vs direct connection
- ✅ Configures connection limits appropriately
- ✅ Provides clear console messages
- ✅ Supports both connection methods seamlessly

Just update your `DATABASE_URL` to use port `6543` to enable session pooler!

