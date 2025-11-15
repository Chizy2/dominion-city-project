# Database Setup for Dominion City Directory

## Quick Setup (Choose One)

### Option 1: Install PostgreSQL Locally (Recommended)

**For macOS:**
```bash
# Install via Homebrew
brew install postgresql@14
brew services start postgresql@14

# Or download Postgres.app from https://postgresapp.com
```

**For Windows:**
- Download from https://www.postgresql.org/download/windows/
- Install and run

**After installation, run:**
```bash
# Create database
createdb dominion_city

# Or with psql
psql postgres -c "CREATE DATABASE dominion_city;"

# Initialize schema
psql dominion_city < backend/config/db-init.sql

# Create admin user
cd backend
npm run init-db
cd ..
```

---

### Option 2: Use Cloud Database (Supabase)

1. Go to https://supabase.com
2. Create a new project (or use existing)
3. Copy your connection string from Project Settings → Database
4. Update `backend/.env`:
```env
DB_HOST=your-project-ref.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_password
```
5. Go to SQL Editor in Supabase dashboard
6. Copy and paste the SQL from `backend/config/db-init.sql`
7. Run it
8. Then run: `cd backend && npm run init-db`

---

### Option 3: Use Neon (Free PostgreSQL in Cloud)

1. Go to https://neon.tech
2. Sign up and create a database
3. Copy your connection string
4. Update `backend/.env` with your Neon credentials
5. Run: `cd backend && npm run init-db`

---

### Option 4: Use Docker

```bash
# Run PostgreSQL in Docker
docker run --name dominion-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -p 5432:5432 \
  -d postgres:14

# Wait a few seconds, then:
createdb -h localhost -U postgres dominion_city
psql dominion_city -U postgres < backend/config/db-init.sql

# Create admin user
cd backend
npm run init-db
```

---

## Current Status

Your app is configured to use **local PostgreSQL** at:
- Host: localhost
- Port: 5432
- Database: dominion_city
- User: postgres
- Password: postgres

**Next Steps:**
1. Install PostgreSQL using one of the methods above
2. Run the commands to create the database
3. The app will work automatically!

---

## Verify Installation

```bash
# Test PostgreSQL
psql -U postgres -c "SELECT version();"

# Or if using Postgres.app
psql -d postgres
```

