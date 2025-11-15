# Backend API Setup Guide

## Issue: Businesses Not Loading

If businesses are not loading, check the following:

### 1. Backend Server Status

The backend must be running for the frontend to load businesses.

**Check if backend is running:**
```bash
cd backend
npm run dev
```

Or check if it's already running:
```bash
lsof -ti:5050
```

### 2. API URL Configuration

The frontend `.env.local` file should point to the correct backend URL:

**For Local Development:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5050/api
```

**For Production:**
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
```

**Current Issue:**
- Your `.env.local` points to `https://cardan.app/api`
- This URL returns 404, meaning the backend is not deployed there
- Use `http://localhost:5050/api` for local development

### 3. CORS Configuration

The backend CORS is configured to allow:
- `http://localhost:3000`
- `http://localhost:3001`
- `https://cardan.app`
- `https://www.cardan.app`

If your frontend is on a different domain, add it to the CORS configuration in `backend/server.js`.

### 4. Testing the API

**Test local backend:**
```bash
curl http://localhost:5050/api/businesses
```

**Test production backend:**
```bash
curl https://your-backend-domain.com/api/businesses
```

### 5. Browser Console

Check the browser console (F12) for:
- Network errors
- CORS errors
- API URL being called
- Response data

### 6. Quick Fix

**For immediate local development:**
1. Ensure backend is running: `cd backend && npm run dev`
2. Update `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:5050/api`
3. Restart frontend: `cd frontend && npm run dev`
4. Check browser console for API calls

### 7. Production Deployment

If deploying to production:
1. Deploy backend to a hosting service (Render, Railway, Heroku, etc.)
2. Get the backend URL (e.g., `https://your-backend.railway.app`)
3. Update `.env.local` with production URL
4. Update backend CORS to allow your frontend domain
5. Redeploy frontend

## Debugging Steps

1. **Check backend logs** - Look for errors in the terminal where backend is running
2. **Check browser Network tab** - See if requests are being made and what the response is
3. **Check browser Console** - Look for JavaScript errors
4. **Verify database connection** - Ensure Supabase is connected and businesses exist
5. **Test API directly** - Use curl or Postman to test the API endpoint

## Common Issues

- **404 errors** - Backend not deployed or wrong URL
- **CORS errors** - Backend CORS not configured for frontend domain
- **Network errors** - Backend not running or firewall blocking
- **Empty data** - All businesses might be unapproved (check `approved = true`)

