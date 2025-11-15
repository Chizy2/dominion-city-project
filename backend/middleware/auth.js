const { supabase } = require('../config/supabase');
const pool = require('../config/database');

// Verify Supabase Auth session (any authenticated user)
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied',
      });
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // Get user role from database
    const userResult = await pool.query(
      'SELECT id, email, name, role, is_admin FROM users WHERE email = $1',
      [user.email]
    );

    let userRole = 'user';
    if (userResult.rows.length > 0) {
      userRole = userResult.rows[0].role || (userResult.rows[0].is_admin ? 'admin' : 'user');
    } else {
      // Fallback to metadata if user not in database
      userRole = user.user_metadata?.role || (user.user_metadata?.is_admin ? 'admin' : 'user');
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: userRole,
      is_admin: userRole === 'admin',
      ...user.user_metadata,
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

// Verify admin privileges
const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied',
      });
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // Get user role from database
    const userResult = await pool.query(
      'SELECT id, email, name, role, is_admin FROM users WHERE email = $1',
      [user.email]
    );

    let userRole = 'user';
    if (userResult.rows.length > 0) {
      userRole = userResult.rows[0].role || (userResult.rows[0].is_admin ? 'admin' : 'user');
    } else {
      // Fallback to metadata
      userRole = user.user_metadata?.role || (user.user_metadata?.is_admin ? 'admin' : 'user');
    }

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: 'admin',
      is_admin: true,
      ...user.user_metadata,
    };
    
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

// Verify moderator or admin privileges
const moderatorAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied',
      });
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // Get user role from database
    const userResult = await pool.query(
      'SELECT id, email, name, role, is_admin FROM users WHERE email = $1',
      [user.email]
    );

    let userRole = 'user';
    if (userResult.rows.length > 0) {
      userRole = userResult.rows[0].role || (userResult.rows[0].is_admin ? 'admin' : 'user');
    } else {
      // Fallback to metadata
      userRole = user.user_metadata?.role || (user.user_metadata?.is_admin ? 'admin' : 'user');
    }

    if (userRole !== 'admin' && userRole !== 'moderator') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Moderator or Admin privileges required.',
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: userRole,
      is_admin: userRole === 'admin',
      ...user.user_metadata,
    };
    
    next();
  } catch (error) {
    console.error('Moderator auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

// Helper function to check if user has permission
const hasPermission = (userRole, requiredRole) => {
  const roleHierarchy = {
    'user': 1,
    'moderator': 2,
    'admin': 3
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

module.exports = { auth, adminAuth, moderatorAuth, hasPermission };
