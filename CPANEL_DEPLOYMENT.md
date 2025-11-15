# cPanel Deployment Guide

This guide will help you deploy the Dominion City Directory application to cPanel hosting.

## 📋 Overview

Your application consists of:
- **Backend**: Node.js/Express API server
- **Frontend**: Next.js application

For cPanel, you have two deployment options:

### Option 1: Separate Deployment (Recommended)
- Deploy backend as a Node.js application
- Deploy frontend as a Next.js application (or static export)

### Option 2: Combined Deployment
- Deploy backend and frontend together with a proxy setup

**We recommend Option 1** for better performance and easier management.

---

## 🚀 Option 1: Separate Deployment (Recommended)

### Part A: Backend Deployment

#### Step 1: Prepare Backend for cPanel

1. Upload the `backend/` folder to your cPanel hosting
2. Recommended path: `public_html/api/` or `~/nodejs/backend/`

#### Step 2: Configure Environment Variables

In cPanel, go to **Node.js** → Select your app → **Environment Variables** and add:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=your_supabase_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
SUPABASE_URL=https://ussoyjjlauhggwsezbhy.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
FRONTEND_URL=https://yourdomain.com
```

**Important Notes:**
- cPanel typically assigns a port automatically via the `PORT` environment variable
- Use the **Session Pooler** connection string (port 6543) for better performance:
  ```
  postgresql://postgres:[PASSWORD]@db.ussoyjjlauhggwsezbhy.supabase.co:6543/postgres?pgbouncer=true
  ```

#### Step 3: Install Dependencies

In cPanel Node.js App Manager:
1. Select your backend app
2. Click **Run NPM Install**
3. Wait for installation to complete

#### Step 4: Start the Application

1. In cPanel Node.js App Manager, click **Start App**
2. Your backend API will be available at: `https://yourdomain.com/api/` (or your configured subdomain)

#### Step 5: Verify Backend

Test the health endpoint:
```bash
curl https://yourdomain.com/api/health
```

---

### Part B: Frontend Deployment

#### Step 1: Build Frontend for Production

**On your local machine:**
```bash
cd frontend
npm install
npm run build
```

This creates an optimized production build in the `.next` folder.

#### Step 2: Configure Environment Variables

Create `frontend/.env.production`:

```env
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_SUPABASE_URL=https://ussoyjjlauhggwsezbhy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

#### Step 3: Upload Frontend Files

Upload the entire `frontend/` folder to cPanel:
- Recommended path: `public_html/` (root of your domain)

#### Step 4: Configure Frontend as Node.js App

1. In cPanel, go to **Node.js** → **Create Application**
2. Set:
   - **Node.js version**: 18.x or 20.x (recommended)
   - **Application mode**: Production
   - **Application root**: `public_html`
   - **Application URL**: Your domain (e.g., `yourdomain.com`)
   - **Application startup file**: `frontend/server.js` or `server.js` (if you create a root server.js)

3. Add environment variables:
   ```env
   NODE_ENV=production
   PORT=3000
   NEXT_PUBLIC_API_URL=https://yourdomain.com/api
   NEXT_PUBLIC_SUPABASE_URL=https://ussoyjjlauhggwsezbhy.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. Click **Run NPM Install**

5. Click **Start App**

---

## 🔄 Option 2: Combined Deployment (Advanced)

If you want to deploy both frontend and backend together:

1. Create a root `server.js` that serves both
2. Use a reverse proxy to route `/api/*` to backend
3. Serve Next.js for all other routes

See `server.combined.js` for an example implementation.

---

## 📝 Important Configuration Files

### Backend `.htaccess` (if needed)
If your backend is in a subdirectory, create `backend/.htaccess`:
```apache
PassengerNodejs /opt/alt/nodejs18/usr/bin/node
PassengerAppRoot /home/username/nodejs/backend
PassengerAppType node
PassengerStartupFile server.js
```

### Frontend `.htaccess`
Create `public_html/.htaccess`:
```apache
PassengerNodejs /opt/alt/nodejs18/usr/bin/node
PassengerAppRoot /home/username/public_html
PassengerAppType node
PassengerStartupFile server.js
```

**Note**: cPanel's Node.js App Manager usually handles this automatically.

---

## 🔧 Troubleshooting

### Backend Issues

1. **Connection Timeout Errors**
   - Check if Supabase project is paused
   - Verify DATABASE_URL is correct
   - Use Session Pooler (port 6543) for better connection management

2. **Port Already in Use**
   - cPanel manages ports automatically
   - Don't hardcode ports in your code
   - Use `process.env.PORT` always

3. **Module Not Found**
   - Run `npm install` in cPanel Node.js App Manager
   - Check that `package.json` has all dependencies

### Frontend Issues

1. **API Connection Errors**
   - Verify `NEXT_PUBLIC_API_URL` points to your backend
   - Check CORS settings in backend
   - Ensure backend is running

2. **Build Errors**
   - Check Node.js version (should be 18.x or 20.x)
   - Verify all environment variables are set
   - Check build logs in cPanel

3. **Static Assets Not Loading**
   - Verify Next.js build completed successfully
   - Check file permissions in cPanel
   - Ensure `.next` folder is uploaded

---

## 🔒 Security Checklist

- [ ] Use strong JWT_SECRET (random, 32+ characters)
- [ ] Never commit `.env` files
- [ ] Use HTTPS only (cPanel provides SSL)
- [ ] Set proper CORS origins (production domains only)
- [ ] Keep dependencies updated
- [ ] Use Supabase Session Pooler for database
- [ ] Set `NODE_ENV=production`
- [ ] Review and restrict admin routes if needed

---

## 📊 Monitoring

### Health Check Endpoints

- Backend: `https://yourdomain.com/api/health`
- Database: `https://yourdomain.com/api/health/db`

### Logs

View logs in cPanel:
- **Node.js App Manager** → Select app → **View Logs**

Or via SSH:
```bash
tail -f ~/logs/nodejs/your-app-name-error.log
tail -f ~/logs/nodejs/your-app-name-output.log
```

---

## 🚀 Post-Deployment

1. **Test all endpoints**
   - Homepage loads
   - Search works
   - Business pages load
   - Admin login works
   - API endpoints respond

2. **Verify environment**
   - Check that production URLs are used
   - Verify database connections
   - Test image uploads (Supabase Storage)

3. **Set up domain**
   - Point domain to cPanel hosting
   - Configure SSL certificate
   - Update DNS if needed

---

## 📞 Support

If you encounter issues:
1. Check cPanel error logs
2. Verify all environment variables are set
3. Ensure Supabase project is active
4. Check database connection string
5. Review Node.js version compatibility

---

## 📚 Additional Resources

- [cPanel Node.js Documentation](https://docs.cpanel.net/cpanel/web-applications/node.js-applications/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)

