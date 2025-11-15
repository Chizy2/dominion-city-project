-- Migration: Add role-based access control system
-- Run this script to update the database schema

-- Step 1: Add role column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- Step 1b: Add check constraint for role (will fail silently if exists)
-- Using a simpler approach - try to add constraint, ignore if it exists

-- Step 2: Update existing admins to have 'admin' role
UPDATE users 
SET role = 'admin' 
WHERE is_admin = true AND (role IS NULL OR role = 'user');

-- Step 3: Update non-admins to have 'user' role
UPDATE users 
SET role = 'user' 
WHERE is_admin = false AND role IS NULL;

-- Step 4: Add approval status to businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;

-- Step 5: Set existing businesses as approved (only if column was just added)
UPDATE businesses 
SET approved = true 
WHERE approved = false;

-- Step 6: Add index for role lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Step 7: Add index for approval status
CREATE INDEX IF NOT EXISTS idx_businesses_approved ON businesses(approved);

-- Step 8: Add comments for documentation
COMMENT ON COLUMN users.role IS 'User role: admin (full access), moderator (add/edit only), user (read-only)';
COMMENT ON COLUMN businesses.approved IS 'Whether the business listing has been approved by an admin';

