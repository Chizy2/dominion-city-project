# Quick Setup Guide

Follow these steps to get the Dominion City Directory up and running.

## 1. Install Dependencies

From the root directory:

```bash
npm run install-all
```

This will install dependencies for the root, backend, and frontend projects.

## 2. Database Setup

### Using PostgreSQL:

```bash
# Create database
createdb dominion_city

# Initialize database (from the project root)
psql dominion_city < backend/config/db-init.sql

# Initialize admin user (from the backend directory)
cd backend
npm run init-db
cd ..
```

The initialization process will:
- Create necessary tables (users, businesses)
- Create indexes for better performance
- Insert default admin credentials with properly hashed password
- Add sample businesses for testing

## 3. Environment Configuration

### Backend (.env)

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dominion_city
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT
JWT_SECRET=generate_a_random_secret_key_here
JWT_EXPIRE=7d

# Admin (already in database, but here for reference)
ADMIN_EMAIL=admin@dominioncity.com
ADMIN_PASSWORD=admin123

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**Important:** Replace all placeholder values with your actual credentials.

### Frontend (.env.local)

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## 4. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Maps JavaScript API
4. Create credentials (API Key)
5. Copy the key to both `.env` and `.env.local`

## 5. Start the Application

From the root directory:

```bash
npm run dev
```

This starts both frontend (port 3000) and backend (port 5000).

Or run separately:

```bash
# Terminal 1
npm run server

# Terminal 2
npm run client
```

## 6. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Admin Login:** http://localhost:3000/admin/login
  - Email: `admin@dominioncity.com`
  - Password: `admin123`

## 7. Verify Setup

1. Open http://localhost:3000
2. You should see sample businesses on the homepage
3. Try searching or browsing by category
4. Click on a business to view its profile
5. Login to admin and check the dashboard

## Troubleshooting

### Database Connection Error

- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists: `psql -l | grep dominion_city`

### Port Already in Use

- Change `PORT` in `backend/.env` to a different port
- Update `NEXT_PUBLIC_API_URL` in `frontend/.env.local`

### Images Not Loading

- Ensure the `uploads/businesses` folder exists in the backend directory
- Check file permissions on the uploads folder

### Google Maps Not Working

- Verify API key is correct
- Ensure Maps JavaScript API is enabled
- Check browser console for errors

## Next Steps

1. Create your first business profile from the admin dashboard
2. Upload images and add location coordinates
3. Customize categories for your directory
4. Set up production deployment (see README.md)

## Production Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Backend (Render/AWS)

1. Set up PostgreSQL database
2. Configure environment variables
3. Set up file storage (S3 recommended)
4. Deploy Node.js app

---

Need help? Check the main README.md for more details.
