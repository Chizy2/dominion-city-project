const { Pool } = require('pg');
require('dotenv').config();

// Prefer a single DATABASE_URL (e.g. from Supabase). Fallback to discrete vars for local dev.
const connectionString = process.env.DATABASE_URL;

// Check if DATABASE_URL points to Supabase (contains 'supabase.co')
const isSupabase = connectionString && connectionString.includes('supabase.co');

// Check if using session pooler (port 6543 or contains pooler/pgbouncer)
const isPooler = connectionString && (
  connectionString.includes(':6543') || 
  connectionString.includes('pooler') || 
  connectionString.includes('pgbouncer=true')
);

let pool;

if (connectionString && isSupabase) {
  // Supabase connection (supports both direct and session pooler)
  const poolConfig = {
    connectionString,
    ssl: { rejectUnauthorized: false }, // Required by Supabase Postgres
    // Increased timeout for Supabase connections (paused projects can take longer to wake up)
    connectionTimeoutMillis: 30000, // 30 seconds - allows time for paused projects to resume
  };

  // Session pooler recommended settings
  if (isPooler) {
    // Session pooler specific configuration
    poolConfig.max = 10; // Limit connections for pooler
    poolConfig.idleTimeoutMillis = 30000;
    poolConfig.connectionTimeoutMillis = 60000; // Increased to 60s for paused projects to wake up
    // Better connection recovery
    poolConfig.allowExitOnIdle = false;
    // Retry configuration
    poolConfig.maxUses = 7500; // Reuse connections longer
    console.log('🔗 Using Supabase Session Pooler (recommended for better connection management)');
  } else {
    // Direct connection settings (can use more connections)
    poolConfig.max = 20;
    poolConfig.idleTimeoutMillis = 30000;
    poolConfig.connectionTimeoutMillis = 60000; // Increased to 60s for paused projects to wake up
    poolConfig.allowExitOnIdle = false;
    poolConfig.maxUses = 7500;
    console.log('🔗 Using Supabase Direct Connection (consider switching to pooler for better performance)');
  }

  pool = new Pool(poolConfig);
} else if (connectionString) {
  // Non-Supabase connection string
  pool = new Pool({
    connectionString,
    ssl: connectionString.includes('ssl') ? { rejectUnauthorized: false } : false,
  });
} else {
  // Local database fallback
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'dominion_city',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  });
}

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  const errorMsg = typeof err === 'string' ? err : (err.message || String(err));
  console.error('❌ Database connection error:', errorMsg);
  
  // Handle various database connection errors
  const isConnectionError = 
    err.code === 'ENOTFOUND' || 
    err.code === 'ECONNREFUSED' ||
    err.code === 'ETIMEDOUT' ||
    errorMsg.includes('timeout') ||
    errorMsg.includes('Connection terminated') ||
    errorMsg.includes('shutdown') ||
    errorMsg.includes('db_termination') ||
    errorMsg.includes('terminating connection');
  
  if (isConnectionError && isSupabase) {
    console.error('\n⚠️  Supabase Database Connection Failed!');
    if (errorMsg.includes('timeout') || errorMsg.includes('Connection terminated')) {
      console.error('Connection timeout detected. This usually means:');
      console.error('1. Your Supabase project is PAUSED (most common)');
      console.error('2. Network connectivity issues');
      console.error('3. Database server is overloaded');
    } else {
      console.error('This usually means your Supabase project is PAUSED or connection was terminated.');
    }
    console.error('\n📋 To fix this:');
    console.error('1. Go to https://supabase.com/dashboard');
    console.error('2. Find your project: ussoyjjlauhggwsezbhy');
    console.error('3. Click "Restore" or "Resume" to wake up the project');
    console.error('4. Wait a few minutes for the database to become available');
    console.error('5. Restart your server\n');
    console.error('Alternatively, set up a local PostgreSQL database:');
    console.error('- Install PostgreSQL locally');
    console.error('- Update backend/.env with local DB credentials');
    console.error('- Remove or comment out DATABASE_URL\n');
  }
  
  // Don't exit on connection errors - let the app handle it gracefully
  // The pool will attempt to reconnect automatically
});

module.exports = pool;
