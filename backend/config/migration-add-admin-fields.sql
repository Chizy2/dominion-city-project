-- Migration: Add admin account fields to users table
-- This migration adds support for storing admin account details including branch

-- Step 1: Add branch column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS branch VARCHAR(255);

-- Step 2: Add supabase_user_id column to link with Supabase Auth
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS supabase_user_id UUID;

-- Step 3: Add index for supabase_user_id lookups
CREATE INDEX IF NOT EXISTS idx_users_supabase_user_id ON users(supabase_user_id);

-- Step 4: Add index for branch lookups
CREATE INDEX IF NOT EXISTS idx_users_branch ON users(branch);

-- Step 5: Add comments for documentation
COMMENT ON COLUMN users.branch IS 'Branch/assembly affiliation for admin users';
COMMENT ON COLUMN users.supabase_user_id IS 'UUID from Supabase Auth to link database user with auth user';

