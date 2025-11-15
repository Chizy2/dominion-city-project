const express = require('express');
const { supabaseAnon } = require('../config/supabase');

const router = express.Router();

// Admin Login using Supabase Auth
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Sign in with Supabase Auth (use anon client for user operations)
    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({
        success: false,
        message: error.message || 'Invalid credentials',
      });
    }

    if (!data.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed',
      });
    }

    // Check user role from database
    const pool = require('../config/database');
    const userCheck = await pool.query(
      'SELECT id, email, name, role, is_admin FROM users WHERE email = $1',
      [email]
    );

    let userRole = 'user';
    let isAdmin = false;
    
    if (userCheck.rows.length > 0) {
      userRole = userCheck.rows[0].role || (userCheck.rows[0].is_admin ? 'admin' : 'user');
      isAdmin = userRole === 'admin';
    } else {
      // Fallback to metadata if user not in database
      userRole = data.user.user_metadata?.role || (data.user.user_metadata?.is_admin ? 'admin' : 'user');
      isAdmin = userRole === 'admin';
    }

    // Only allow admin and moderator login
    if (userRole !== 'admin' && userRole !== 'moderator') {
      await supabaseAnon.auth.signOut();
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or Moderator privileges required.',
      });
    }

    // Return session token (Supabase handles session management)
    res.json({
      success: true,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
      user: {
        id: data.user.id,
        email: data.user.email,
        name: userCheck.rows[0]?.name || data.user.user_metadata?.name || data.user.email,
        role: userRole,
        is_admin: isAdmin,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// Logout (optional - can be handled client-side)
router.post('/logout', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      // Sign out the session (use anon client for user operations)
      await supabaseAnon.auth.signOut();
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout error',
    });
  }
});

module.exports = router;
