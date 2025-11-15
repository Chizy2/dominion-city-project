# Backend environment setup

Create a file named `.env` in this directory with the following variables. Prefer `DATABASE_URL` when using Supabase.

```
NODE_ENV=development
PORT=5000

# Prefer this for Supabase (copy from Supabase → Project Settings → Database → Connection string → URI)
# Example: postgres://postgres:YOUR_PASSWORD@YOUR_PROJECT_REF.supabase.co:5432/postgres
DATABASE_URL=

# Fallback discrete settings (used when DATABASE_URL is not set)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dominion_city
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=change_me_dev_secret
JWT_EXPIRE=7d

# Admin (reference)
ADMIN_EMAIL=admin@dominioncity.com
ADMIN_PASSWORD=admin123

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```


