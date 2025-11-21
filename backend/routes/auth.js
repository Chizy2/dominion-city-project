const express = require('express');
const { supabaseAnon, supabase } = require('../config/supabase');

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

    // Check if email is confirmed
    if (!data.user.email_confirmed_at) {
      await supabaseAnon.auth.signOut();
      return res.status(403).json({
        success: false,
        message: 'Please verify your email address before logging in. Check your inbox for the confirmation email.',
      });
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

// Admin Sign Up using Supabase Auth
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, branch } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      });
    }

    if (!branch || !branch.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Branch is required',
      });
    }

    // Validate email domain - only allow @dcdirect.online
    const allowedDomain = '@dcdirect.online';
    if (!email.toLowerCase().endsWith(allowedDomain.toLowerCase())) {
      return res.status(403).json({
        success: false,
        message: `Only email addresses from ${allowedDomain} are allowed to create admin accounts`,
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    // Use service role client to create admin user with metadata
    // This bypasses RLS and allows setting admin metadata
    // email_confirm: false means user must verify email before accessing account
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Require email confirmation before granting access
      user_metadata: {
        name: name.trim(),
        branch: branch.trim(),
        role: 'admin',
        is_admin: true,
      },
    });

    if (error) {
      console.error('Signup error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create admin account',
      });
    }

    if (!data.user) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create user',
      });
    }

    // Log successful admin account creation
    console.log('✅ Admin account created:', {
      id: data.user.id,
      email: data.user.email,
      name: name.trim(),
      branch: branch.trim(),
      createdAt: data.user.created_at,
    });

    // Create user record in database with all details
    try {
      const pool = require('../config/database');
      
      // First, try to add branch column if it doesn't exist (for existing databases)
      try {
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS branch VARCHAR(255)');
      } catch (alterError) {
        // Column might already exist, ignore
        if (!alterError.message.includes('already exists')) {
          console.warn('Could not add branch column:', alterError.message);
        }
      }

      // Try to add supabase_user_id column if it doesn't exist
      try {
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS supabase_user_id UUID');
      } catch (alterError) {
        // Column might already exist, ignore
        if (!alterError.message.includes('already exists')) {
          console.warn('Could not add supabase_user_id column:', alterError.message);
        }
      }

      // Insert or update user record using email as unique identifier
      // Since users table has SERIAL id but Supabase uses UUID, we use email for matching
      // Password is stored in Supabase Auth, so we use a placeholder
      const insertResult = await pool.query(
        `INSERT INTO users (email, password, name, role, is_admin, branch, supabase_user_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         ON CONFLICT (email) DO UPDATE SET
           name = EXCLUDED.name,
           role = EXCLUDED.role,
           is_admin = EXCLUDED.is_admin,
           branch = EXCLUDED.branch,
           supabase_user_id = EXCLUDED.supabase_user_id`,
        [
          data.user.email,
          'supabase_auth', // Placeholder - password is managed by Supabase Auth
          name.trim(),
          'admin',
          true,
          branch.trim(),
          data.user.id, // Supabase Auth UUID
        ]
      );
      
      console.log('✅ User record saved to database:', {
        email: data.user.email,
        name: name.trim(),
        branch: branch.trim(),
        supabaseUserId: data.user.id,
      });
    } catch (dbError) {
      console.error('❌ Database insert error:', dbError.message);
      console.error('Error details:', dbError);
      // Don't fail signup if database insert fails - Supabase user is created
      // But log it as an error since we want to capture this data
    }

    // Supabase automatically sends confirmation email when email_confirm is false
    // No need to manually trigger it

    res.json({
      success: true,
      message: 'Admin account created successfully. Please check your email to verify your account before logging in.',
      requiresEmailConfirmation: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: name.trim(),
        branch: branch.trim(),
        role: 'admin',
        is_admin: true,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
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
