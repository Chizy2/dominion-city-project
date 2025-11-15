const { supabase } = require('./supabase');

/**
 * Migration script to create admin user in Supabase Auth
 * Run this once: node config/migrate-admin-to-supabase.js
 */
async function migrateAdminToSupabase() {
  try {
    console.log('Starting admin migration to Supabase Auth...\n');

    // Check if user already exists in Supabase Auth
    console.log('Checking for existing admin user in Supabase Auth...\n');
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      console.error('\n💡 This might indicate:');
      console.error('1. SUPABASE_SERVICE_ROLE_KEY is not set in backend/.env');
      console.error('2. The service role key is incorrect');
      console.error('3. Supabase project URL is incorrect\n');
      process.exit(1);
    }

    const existingUser = existingUsers.users.find(u => u.email === 'admin@dominioncity.com');

    if (existingUser) {
      console.log('Found existing admin user in Supabase Auth.');
      console.log('Updating admin user metadata...\n');

      // Update existing user to ensure admin role and flag are set
      const { data, error } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          user_metadata: {
            name: 'Admin User',
            role: 'admin',
            is_admin: true,
          },
          email_confirm: true,
        }
      );

      // Also ensure user exists in database with correct role
      const pool = require('../config/database');
      try {
        await pool.query(
          `INSERT INTO users (email, name, role, is_admin, password) 
           VALUES ($1, $2, $3, $4, $5) 
           ON CONFLICT (email) DO UPDATE SET role = $3, is_admin = $4`,
          ['admin@dominioncity.com', 'Admin User', 'admin', true, 'supabase_auth']
        );
      } catch (dbError) {
        console.warn('Note: Could not sync with database (this is okay if already synced)');
      }

      if (error) {
        console.error('Error updating admin user:', error);
        process.exit(1);
      }

      console.log('✅ Admin user updated in Supabase Auth!');
      console.log('\n📝 Login Credentials:');
      console.log('   Email: admin@dominioncity.com');
      console.log('   Password: Use existing password or reset in Supabase Dashboard\n');
    } else {
      console.log('No admin user found in Supabase Auth.');
      console.log('Creating admin user in Supabase Auth...\n');

      // Create admin user in Supabase Auth using admin API
      // Note: This requires SUPABASE_SERVICE_ROLE_KEY in .env
      const { data, error } = await supabase.auth.admin.createUser({
        email: 'admin@dominioncity.com',
        password: 'admin123',
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          name: 'Admin User',
          role: 'admin',
          is_admin: true,
        },
      });

      // Also create user in database with admin role
      const pool = require('../config/database');
      try {
        await pool.query(
          `INSERT INTO users (email, name, role, is_admin, password) 
           VALUES ($1, $2, $3, $4, $5) 
           ON CONFLICT (email) DO UPDATE SET role = $3, is_admin = $4`,
          ['admin@dominioncity.com', 'Admin User', 'admin', true, 'admin123']
        );
      } catch (dbError) {
        console.warn('Note: Could not create user in database (this is okay if already exists)');
      }

      if (error) {
        console.error('Error creating admin user:', error);
        console.error('\n💡 This might indicate:');
        console.error('1. SUPABASE_SERVICE_ROLE_KEY is not set in backend/.env');
        console.error('2. The service role key is incorrect');
        console.error('3. Supabase project URL is incorrect\n');
        process.exit(1);
      }

      console.log('✅ Admin user created in Supabase Auth!');
      console.log('\n📝 Login Credentials:');
      console.log('   Email: admin@dominioncity.com');
      console.log('   Password: admin123\n');
    }

    console.log('✅ Migration complete!');
    console.log('\n📌 Next steps:');
    console.log('   1. Test login at /admin/login');
    console.log('   2. If login fails, you may need to reset password in Supabase Dashboard\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration error:', error.message);
    console.error('\n💡 To fix this:');
    console.error('1. Ensure SUPABASE_SERVICE_ROLE_KEY is set in backend/.env');
    console.error('2. Check Supabase project is active');
    console.error('3. Verify database connection\n');
    process.exit(1);
  }
}

migrateAdminToSupabase();

