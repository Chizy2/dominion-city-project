/**
 * Combined Server for cPanel Deployment (Optional)
 * 
 * This file serves both frontend and backend together.
 * Only use this if you want to deploy everything as a single Node.js app.
 * 
 * For separate deployment (recommended), deploy backend and frontend separately.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const next = require('next');
require('dotenv').config();

// Backend routes
const authRoutes = require('./backend/routes/auth');
const businessRoutes = require('./backend/routes/businesses');
const adminRoutes = require('./backend/routes/admin');
const moderatorRoutes = require('./backend/routes/moderator');
const storageRoutes = require('./backend/routes/storage');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Next.js
const nextApp = next({ 
  dev: false,
  dir: path.join(__dirname, 'frontend')
});
const handle = nextApp.getRequestHandler();

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    `https://${process.env.FRONTEND_URL}`,
    `http://${process.env.FRONTEND_URL}`
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Backend API routes
app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/moderator', moderatorRoutes);
app.use('/api/storage', storageRoutes);

// Health check endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Dominion City API is running' });
});

app.get('/api/health/db', async (req, res) => {
  const pool = require('./backend/config/database');
  try {
    const result = await pool.query('SELECT NOW()');
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const businessCount = await pool.query('SELECT COUNT(*) FROM businesses');
    res.json({
      status: 'ok',
      message: 'Database connected',
      timestamp: result.rows[0].now,
      users: userCount.rows[0].count,
      businesses: businessCount.rows[0].count
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Start server
nextApp.prepare().then(() => {
  // Handle all other routes with Next.js
  app.get('*', (req, res) => {
    return handle(req, res);
  });

  app.listen(PORT, () => {
    console.log(`🚀 Combined server running on port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔌 API: http://localhost:${PORT}/api`);
  });
}).catch((ex) => {
  console.error(ex.stack);
  process.exit(1);
});


