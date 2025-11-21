/**
 * Supabase Database Keep-Alive Service
 * 
 * Prevents Supabase free tier projects from auto-pausing by sending periodic queries.
 * Free tier projects pause after 1 week of inactivity.
 * 
 * This service runs a simple query every 6 days to keep the database active.
 */

const pool = require('./database');

let keepAliveInterval = null;

/**
 * Send a keep-alive query to prevent database from pausing
 */
async function keepAlive() {
  try {
    // Simple query that doesn't affect data
    await pool.query('SELECT NOW()');
    console.log('✅ Keep-alive query sent - database remains active');
  } catch (error) {
    console.warn('⚠️  Keep-alive query failed:', error.message);
    // Don't throw - this is just a background service
  }
}

/**
 * Start the keep-alive service
 * Runs every 6 days (144 hours) to prevent auto-pause
 * Free tier pauses after 7 days of inactivity, so 6 days is safe
 */
function startKeepAlive() {
  // Check if DATABASE_URL points to Supabase
  const connectionString = process.env.DATABASE_URL;
  const isSupabase = connectionString && connectionString.includes('supabase.co');
  
  if (!isSupabase) {
    console.log('ℹ️  Keep-alive service skipped (not using Supabase)');
    return;
  }

  // Run immediately on startup
  keepAlive();
  
  // Then run every 6 days (518400000 milliseconds)
  const intervalMs = 6 * 24 * 60 * 60 * 1000; // 6 days
  
  keepAliveInterval = setInterval(() => {
    keepAlive();
  }, intervalMs);
  
  console.log(`🔄 Keep-alive service started (runs every 6 days)`);
  console.log(`   This prevents Supabase free tier from auto-pausing`);
}

/**
 * Stop the keep-alive service
 */
function stopKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
    console.log('🛑 Keep-alive service stopped');
  }
}

// Auto-start if this module is required
if (require.main !== module) {
  // Only start if we're in a server context (not during tests)
  if (process.env.NODE_ENV !== 'test') {
    startKeepAlive();
  }
}

module.exports = {
  startKeepAlive,
  stopKeepAlive,
  keepAlive,
};

