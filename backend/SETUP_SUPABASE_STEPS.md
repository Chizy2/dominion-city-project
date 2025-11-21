# 🚀 Supabase Setup Steps

Your backend is **already configured** to work with Supabase! You just need to add your connection string.

## ✅ Current Status

- ✅ Database code supports Supabase (via `DATABASE_URL`)
- ✅ Tables already exist in your Supabase project
- ✅ Your project URL: `ussoyjjlauhggwsezbhy.supabase.co`

## 📝 Step-by-Step Setup

### Step 1: Get Your Supabase Database Password

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Project Settings** → **Database**
4. Find your **Database Password**
   - If you forgot it, click **Reset database password**

### Step 2: Get Your Connection String

1. In the same **Database** settings page
2. Scroll to **Connection string** section
3. Click the **URI** tab
4. Copy the connection string

It will look like:
```
postgresql://postgres:[YOUR-PASSWORD]@db.ussoyjjlauhggwsezbhy.supabase.co:5432/postgres
```

### Step 3: Create or Update backend/.env

Create or edit `backend/.env` file and add:

```env
NODE_ENV=development
PORT=5051

# SUPABASE DATABASE CONNECTION
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.ussoyjjlauhggwsezbhy.supabase.co:5432/postgres

# Fallback settings (ignored when DATABASE_URL is set)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dominion_city
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d

# Admin (created by init-db script)
ADMIN_EMAIL=admin@dominioncity.com
ADMIN_PASSWORD=admin123

# Google Maps API (optional)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**Important:** Replace `YOUR_PASSWORD` with your actual Supabase database password!

### Step 4: Test Connection

Run this command to test and initialize:

```bash
cd backend
npm run init-db
```

You should see:
```
✅ Database connection successful!
✅ Admin user created successfully! (or already exists)
✅ Database initialization complete!
```

### Step 5: Start Your Server

```bash
cd backend
npm run dev
```

You should see: `Connected to PostgreSQL database`

## 🔍 Troubleshooting

### "getaddrinfo ENOTFOUND" Error
- Make sure you're using the correct connection string format
- Check that your Supabase project is active

### "password authentication failed"
- Double-check your database password
- URL-encode special characters in password if needed

### Connection works but admin user not created
- Run `npm run init-db` again
- Check Supabase dashboard to verify user was created

## ✅ What's Already Done

1. ✅ Database configuration supports Supabase
2. ✅ SSL handling configured for Supabase
3. ✅ Tables exist in your Supabase project
4. ✅ Migration scripts ready

## 🎯 Next Steps

**All you need to do is:**
1. Get your Supabase database password
2. Create `backend/.env` with `DATABASE_URL` pointing to Supabase
3. Run `npm run init-db`
4. Start your server!

Your Supabase project is ready - just add the connection string! 🚀

