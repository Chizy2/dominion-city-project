const bcrypt = require('bcryptjs');
const pool = require('./database');

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    console.log('Connecting to database...\n');

    // Test database connection first
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!\n');

    // Check if admin user exists
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@dominioncity.com']);
    
    if (userCheck.rows.length > 0) {
      console.log('✅ Admin user already exists.');
    } else {
      // Create admin user with hashed password
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await pool.query(
        'INSERT INTO users (email, password, name, is_admin) VALUES ($1, $2, $3, $4)',
        ['admin@dominioncity.com', hashedPassword, 'Admin User', true]
      );
      
      console.log('✅ Admin user created successfully!');
      console.log('\n📝 Login Credentials:');
      console.log('   Email: admin@dominioncity.com');
      console.log('   Password: admin123\n');
    }

    console.log('✅ Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error initializing database:', error.message);
    console.error('\n💡 To fix this:');
    console.error('1. Check your database connection in backend/.env');
    console.error('2. Make sure the database is running and accessible');
    console.error('3. Run the SQL schema: psql < db-init.sql');
    console.error('4. Try again with: npm run init-db\n');
    process.exit(1);
  }
}

initializeDatabase();
