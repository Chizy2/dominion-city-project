require('dotenv').config();
const pool = require('../config/database');

async function runMigration() {
  try {
    console.log('🔄 Running role-based access control migration...\n');
    
    const steps = [
      {
        name: 'Add role column to users table',
        sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user'`,
        ignoreError: ['42701'] // duplicate column
      },
      {
        name: 'Add role check constraint',
        sql: `ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'moderator', 'user'))`,
        ignoreError: ['42710', '23514'] // duplicate object, check constraint violation
      },
      {
        name: 'Update existing admins to admin role',
        sql: `UPDATE users SET role = 'admin' WHERE is_admin = true AND (role IS NULL OR role = 'user')`,
        ignoreError: []
      },
      {
        name: 'Update non-admins to user role',
        sql: `UPDATE users SET role = 'user' WHERE is_admin = false AND role IS NULL`,
        ignoreError: []
      },
      {
        name: 'Add approved column to businesses table',
        sql: `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false`,
        ignoreError: ['42701'] // duplicate column
      },
      {
        name: 'Set existing businesses as approved',
        sql: `UPDATE businesses SET approved = true WHERE approved = false`,
        ignoreError: []
      },
      {
        name: 'Add index for role lookups',
        sql: `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`,
        ignoreError: ['42P07'] // duplicate table/index
      },
      {
        name: 'Add index for approval status',
        sql: `CREATE INDEX IF NOT EXISTS idx_businesses_approved ON businesses(approved)`,
        ignoreError: ['42P07'] // duplicate table/index
      },
      {
        name: 'Add comment to users.role',
        sql: `COMMENT ON COLUMN users.role IS 'User role: admin (full access), moderator (add/edit only), user (read-only)'`,
        ignoreError: ['42703'] // column doesn't exist (shouldn't happen)
      },
      {
        name: 'Add comment to businesses.approved',
        sql: `COMMENT ON COLUMN businesses.approved IS 'Whether the business listing has been approved by an admin'`,
        ignoreError: ['42703'] // column doesn't exist (shouldn't happen)
      }
    ];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      try {
        await pool.query(step.sql);
        console.log(`✅ [${i + 1}/${steps.length}] ${step.name}`);
      } catch (error) {
        if (step.ignoreError.includes(error.code)) {
          console.log(`⚠️  [${i + 1}/${steps.length}] ${step.name} (skipped - ${error.code})`);
        } else {
          console.error(`❌ [${i + 1}/${steps.length}] ${step.name}`);
          console.error('❌ Error:', error.message);
          console.error('❌ Code:', error.code);
          throw error;
        }
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update existing users in Supabase Auth with role metadata');
    console.log('2. Test the new role system');
    console.log('3. Update frontend to handle role-based UI');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();

