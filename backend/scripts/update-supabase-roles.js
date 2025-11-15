require('dotenv').config();
const { supabase } = require('../config/supabase');
const pool = require('../config/database');

/**
 * Sync Supabase Auth users with database roles
 * This script:
 * 1. Fetches all users from Supabase Auth
 * 2. Updates their user_metadata with role information
 * 3. Syncs with database users table
 */
async function updateSupabaseRoles() {
  try {
    console.log('🔄 Syncing Supabase Auth users with role-based configuration...\n');

    // Check if service role key is available
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set in backend/.env');
      console.error('   This is required to update user metadata in Supabase Auth.\n');
      process.exit(1);
    }

    // Get all users from Supabase Auth
    console.log('📋 Fetching users from Supabase Auth...');
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('❌ Error fetching users from Supabase Auth:', listError.message);
      process.exit(1);
    }

    console.log(`✅ Found ${authUsers.users.length} user(s) in Supabase Auth\n`);

    // Get all users from database
    const dbUsersResult = await pool.query('SELECT id, email, name, role, is_admin FROM users');
    const dbUsers = dbUsersResult.rows;
    console.log(`📋 Found ${dbUsers.length} user(s) in database\n`);

    // Create a map of database users by email
    const dbUsersByEmail = {};
    dbUsers.forEach(user => {
      dbUsersByEmail[user.email] = user;
    });

    let updatedCount = 0;
    let createdCount = 0;
    let skippedCount = 0;

    // Process each Supabase Auth user
    for (const authUser of authUsers.users) {
      const email = authUser.email;
      const dbUser = dbUsersByEmail[email];

      // Determine role from database or use default
      let role = 'user';
      let isAdmin = false;

      if (dbUser) {
        // User exists in database - use database role
        role = dbUser.role || (dbUser.is_admin ? 'admin' : 'user');
        isAdmin = role === 'admin';
        
        console.log(`📝 Processing: ${email} (DB role: ${role})`);
      } else {
        // User exists in Supabase Auth but not in database
        // Check existing metadata
        role = authUser.user_metadata?.role || (authUser.user_metadata?.is_admin ? 'admin' : 'user');
        isAdmin = role === 'admin';
        
        console.log(`📝 Processing: ${email} (Auth only, role: ${role})`);
        
        // Create user in database
        try {
          await pool.query(
            `INSERT INTO users (email, name, role, is_admin, password) 
             VALUES ($1, $2, $3, $4, $5) 
             ON CONFLICT (email) DO UPDATE SET role = $3, is_admin = $4`,
            [
              email,
              authUser.user_metadata?.name || email.split('@')[0],
              role,
              isAdmin,
              'supabase_auth' // Placeholder - password is managed by Supabase Auth
            ]
          );
          createdCount++;
          console.log(`   ✅ Created user in database`);
        } catch (error) {
          console.error(`   ⚠️  Error creating user in database: ${error.message}`);
        }
      }

      // Update Supabase Auth user metadata
      const newMetadata = {
        ...authUser.user_metadata,
        role: role,
        is_admin: isAdmin,
      };

      // Only update if metadata has changed
      const needsUpdate = 
        authUser.user_metadata?.role !== role ||
        authUser.user_metadata?.is_admin !== isAdmin;

      if (needsUpdate) {
        try {
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            authUser.id,
            {
              user_metadata: newMetadata,
            }
          );

          if (updateError) {
            console.error(`   ❌ Error updating Supabase Auth user: ${updateError.message}`);
            skippedCount++;
          } else {
            console.log(`   ✅ Updated Supabase Auth metadata: role=${role}, is_admin=${isAdmin}`);
            updatedCount++;
          }
        } catch (error) {
          console.error(`   ❌ Error updating user: ${error.message}`);
          skippedCount++;
        }
      } else {
        console.log(`   ⏭️  Already up to date`);
        skippedCount++;
      }

      console.log('');
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log(`   ✅ Updated: ${updatedCount} user(s)`);
    console.log(`   ➕ Created in DB: ${createdCount} user(s)`);
    console.log(`   ⏭️  Skipped: ${skippedCount} user(s)`);
    console.log(`   📋 Total processed: ${authUsers.users.length} user(s)\n`);

    // Check for users in database that don't exist in Supabase Auth
    const authUserEmails = new Set(authUsers.users.map(u => u.email));
    const orphanedDbUsers = dbUsers.filter(dbUser => !authUserEmails.has(dbUser.email));

    if (orphanedDbUsers.length > 0) {
      console.log('⚠️  Warning: Found users in database that don\'t exist in Supabase Auth:');
      orphanedDbUsers.forEach(user => {
        console.log(`   - ${user.email} (role: ${user.role || 'user'})`);
      });
      console.log('\n   These users need to be created in Supabase Auth to use the system.\n');
    }

    console.log('✅ Supabase role sync completed!\n');
    console.log('📋 Next steps:');
    console.log('   1. Test login with admin/moderator accounts');
    console.log('   2. Verify role-based permissions are working');
    console.log('   3. Create additional moderators if needed\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error syncing Supabase roles:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

updateSupabaseRoles();

