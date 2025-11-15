# 🚀 cPanel Deployment Checklist

Use this checklist to ensure a smooth deployment to cPanel hosting.

## 📦 Pre-Deployment

### Local Preparation
- [ ] Build frontend: `cd frontend && npm run build`
- [ ] Test backend locally: `cd backend && npm start`
- [ ] Verify all environment variables are documented
- [ ] Remove any development-only code
- [ ] Check for hardcoded URLs (localhost, etc.)
- [ ] Review and update CORS settings

### File Preparation
- [ ] All files are ready for upload
- [ ] `.env` files are NOT included (use cPanel environment variables)
- [ ] `node_modules` should NOT be uploaded (install via cPanel)
- [ ] `.git` folder removed (if uploading directly)

---

## 🔧 Backend Deployment

### Step 1: Upload Backend
- [ ] Upload `backend/` folder to cPanel
- [ ] Recommended location: `~/nodejs/backend/` or `public_html/api/`

### Step 2: Create Node.js App (Backend)
- [ ] Go to cPanel → **Node.js** → **Create Application**
- [ ] Set Node.js version: **18.x or 20.x**
- [ ] Application mode: **Production**
- [ ] Application root: `nodejs/backend` (or your path)
- [ ] Application URL: `yourdomain.com/api` (or subdomain)
- [ ] Application startup file: `server.js`
- [ ] Click **Create**

### Step 3: Configure Environment Variables (Backend)
- [ ] Open your backend app → **Environment Variables**
- [ ] Add all variables from `ENV_PRODUCTION.md`
- [ ] Verify `DATABASE_URL` uses Session Pooler (port 6543)
- [ ] Verify `FRONTEND_URL` matches your domain
- [ ] Verify `NODE_ENV=production`

### Step 4: Install Dependencies (Backend)
- [ ] Click **Run NPM Install**
- [ ] Wait for completion
- [ ] Check for errors

### Step 5: Start Backend
- [ ] Click **Start App**
- [ ] Check logs for errors
- [ ] Test health endpoint: `https://yourdomain.com/api/health`

---

## 🎨 Frontend Deployment

### Step 1: Build Frontend (Local)
- [ ] `cd frontend`
- [ ] `npm install` (if needed)
- [ ] Create `.env.production` with production values
- [ ] `npm run build`
- [ ] Verify `.next` folder exists

### Step 2: Upload Frontend
- [ ] Upload entire `frontend/` folder to cPanel
- [ ] Recommended location: `public_html/`

### Step 3: Create Node.js App (Frontend)
- [ ] Go to cPanel → **Node.js** → **Create Application**
- [ ] Set Node.js version: **18.x or 20.x**
- [ ] Application mode: **Production**
- [ ] Application root: `public_html`
- [ ] Application URL: `yourdomain.com`
- [ ] Application startup file: `server.js`
- [ ] Click **Create**

### Step 4: Configure Environment Variables (Frontend)
- [ ] Open your frontend app → **Environment Variables**
- [ ] Add all variables from `ENV_PRODUCTION.md`
- [ ] Verify `NEXT_PUBLIC_API_URL` points to backend
- [ ] Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- [ ] Verify `NODE_ENV=production`

### Step 5: Install Dependencies (Frontend)
- [ ] Click **Run NPM Install**
- [ ] Wait for completion
- [ ] Check for errors

### Step 6: Start Frontend
- [ ] Click **Start App**
- [ ] Check logs for errors
- [ ] Test homepage loads

---

## ✅ Post-Deployment Testing

### Backend Tests
- [ ] Health check: `https://yourdomain.com/api/health`
- [ ] Database health: `https://yourdomain.com/api/health/db`
- [ ] API endpoints respond correctly
- [ ] CORS works (frontend can access backend)

### Frontend Tests
- [ ] Homepage loads
- [ ] Search functionality works
- [ ] Business pages load
- [ ] Admin login works
- [ ] Images load correctly
- [ ] No console errors

### Integration Tests
- [ ] Frontend can communicate with backend
- [ ] Authentication works
- [ ] Image uploads work (Supabase Storage)
- [ ] Database queries work
- [ ] All features functional

---

## 🔒 Security Verification

- [ ] SSL certificate installed and active
- [ ] All URLs use HTTPS
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] SUPABASE_SERVICE_ROLE_KEY is kept secret
- [ ] CORS only allows production domains
- [ ] No sensitive data in logs
- [ ] Environment variables are secure

---

## 📊 Monitoring Setup

- [ ] Logs are accessible in cPanel
- [ ] Error monitoring configured (if applicable)
- [ ] Health check endpoints tested
- [ ] Database connection monitored

---

## 🐛 Troubleshooting

### Backend Issues
- [ ] Check Node.js version (should be 18.x or 20.x)
- [ ] Verify all environment variables are set
- [ ] Check database connection (Supabase project active?)
- [ ] Review error logs in cPanel
- [ ] Test database connection string

### Frontend Issues
- [ ] Verify Next.js build completed successfully
- [ ] Check environment variables (especially NEXT_PUBLIC_*)
- [ ] Verify API URL is correct
- [ ] Check CORS configuration in backend
- [ ] Review browser console for errors

### Connection Issues
- [ ] Verify Supabase project is not paused
- [ ] Check network connectivity
- [ ] Verify firewall rules
- [ ] Test database connection string
- [ ] Use Session Pooler for database

---

## 📝 Documentation

- [ ] All environment variables documented
- [ ] Deployment process documented
- [ ] Troubleshooting guide available
- [ ] Team members have access to cPanel

---

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ All endpoints respond correctly
- ✅ Frontend loads without errors
- ✅ Backend API is accessible
- ✅ Database connections work
- ✅ Authentication works
- ✅ All features functional
- ✅ SSL certificate active
- ✅ No console errors
- ✅ Performance is acceptable

---

## 📞 Need Help?

- Review `CPANEL_DEPLOYMENT.md` for detailed instructions
- Check `ENV_PRODUCTION.md` for environment variables
- Review cPanel error logs
- Check Supabase project status
- Verify database connection

---

## 🔄 Update/Deployment Process

For future updates:
1. Make changes locally
2. Test locally
3. Build frontend: `npm run build`
4. Upload changed files to cPanel
5. Run `npm install` if dependencies changed
6. Restart Node.js apps in cPanel
7. Test all functionality
8. Monitor logs for errors

---

**Last Updated**: [Date]
**Deployed By**: [Name]
**Domain**: [Your Domain]


