# Setting Up Supabase Database Connection

Your backend is already configured to work with Supabase! Follow these steps:

## Step 1: Get Your Supabase Database Password

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Project Settings** → **Database**
4. Find your **Database Password** (if you forgot it, you can reset it)

## Step 2: Get Your Connection String

In the same **Database** settings page:
1. Scroll to **Connection string** section
2. Click on **URI** tab
3. Copy the connection string

Your connection string format should be:
```
postgresql://postgres:[YOUR-PASSWORD]@db.ussoyjjlauhggwsezbhy.supabase.co:5432/postgres
```

**Important:** Replace `[YOUR-PASSWORD]` with your actual database password. If your password contains special characters, you may need to URL-encode them.

## Step 3: Update backend/.env

I'll help you update your `.env` file. Just provide your Supabase database password and I'll set it up!

Your current Supabase project URL is: `https://ussoyjjlauhggwsezbhy.supabase.co`

The connection string will be:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.ussoyjjlauhggwsezbhy.supabase.co:5432/postgres
```

## Step 4: Initialize Admin User

After updating `.env`, run:

```bash
cd backend
npm run init-db
```

This will:
- Test the database connection
- Create the admin user (if it doesn't exist)
- Verify everything is working

## Step 5: Test the Connection

Start your backend server:

```bash
cd backend
npm run dev
```

You should see: `Connected to PostgreSQL database`

## Current Status

✅ Database configuration supports Supabase (already done!)
✅ Tables already exist in your Supabase project:
   - `users` table (ready for admin user)
   - `businesses` table (16 businesses already in database)
✅ Supabase project URL: ussoyjjlauhggwsezbhy.supabase.co

## Quick Setup

**Just provide your Supabase database password and I'll update the .env file for you!**

Or manually edit `backend/.env` and add:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.ussoyjjlauhggwsezbhy.supabase.co:5432/postgres
```

Replace `YOUR_PASSWORD` with your actual password.
