# VPS Deployment Configuration for dcdirect.online

## 🌐 Domain Configuration

Your application is configured to be hosted on **`dcdirect.online`**.

## 📋 Environment Variables for VPS

### Backend Environment Variables

Set these in your VPS environment (e.g., `.env` file or systemd service):

```env
NODE_ENV=production
PORT=5051

# Database Connection (Supabase Session Pooler - port 6543)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.ussoyjjlauhggwsezbhy.supabase.co:6543/postgres?pgbouncer=true

# Supabase Configuration
SUPABASE_URL=https://ussoyjjlauhggwsezbhy.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Frontend URL (for CORS)
FRONTEND_URL=https://dcdirect.online

# Google Maps API (Optional)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### Frontend Environment Variables

Set these in your VPS environment for the frontend:

```env
NODE_ENV=production
PORT=3000

# Next.js requires NEXT_PUBLIC_ prefix for client-side variables
NEXT_PUBLIC_API_URL=https://dcdirect.online/api
NEXT_PUBLIC_SUPABASE_URL=https://ussoyjjlauhggwsezbhy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## 🔧 Configuration Details

### API URL Configuration

The frontend API client (`frontend/lib/api.ts`) is configured to:
- **Development**: Use `http://localhost:5051/api` when running locally
- **Production**: Automatically detect `dcdirect.online` and use `https://dcdirect.online/api`

### CORS Configuration

The backend (`backend/server.js`) is configured to:
- Allow requests from `https://dcdirect.online`
- Allow requests from `https://www.dcdirect.online` (if using www)
- Allow localhost in development mode

## 🚀 Deployment Steps

### 1. Backend Deployment

1. **Set environment variables** (see above)
2. **Install dependencies**: `cd backend && npm install`
3. **Start the server**: `npm start` or use PM2/systemd
4. **Verify**: `curl https://dcdirect.online/api/health`

### 2. Frontend Deployment

1. **Build the frontend**: `cd frontend && npm run build`
2. **Set environment variables** (see above)
3. **Start the server**: `npm start` or use PM2/systemd
4. **Verify**: Open `https://dcdirect.online` in browser

## 🔍 Testing Endpoints

After deployment, test these endpoints:

- **Backend Health**: `https://dcdirect.online/api/health`
- **Database Health**: `https://dcdirect.online/api/health/db`
- **Frontend**: `https://dcdirect.online`

## 📝 Notes

- The backend runs on port **5051** by default (configurable via `PORT` env var)
- The frontend runs on port **3000** by default (configurable via `PORT` env var)
- Use a reverse proxy (nginx/Apache) to route traffic from port 80/443 to your Node.js apps
- Ensure SSL certificates are configured for HTTPS

## 🔒 SSL/HTTPS Setup

Make sure to:
1. Configure SSL certificates (Let's Encrypt recommended)
2. Set up reverse proxy (nginx/Apache) to handle HTTPS
3. Redirect HTTP to HTTPS
4. Update DNS records to point `dcdirect.online` to your VPS IP

## 📚 Additional Resources

- See `ENV_PRODUCTION.md` for detailed environment variable setup
- See `CPANEL_DEPLOYMENT.md` for cPanel-specific instructions (if applicable)
- See `DEPLOYMENT_CHECKLIST.md` for a complete deployment checklist

