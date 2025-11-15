# Supabase Role Sync Guide

## Overview

The role-based access control system syncs user roles between:
1. **Supabase Auth** (authentication) - stores role in `user_metadata`
2. **PostgreSQL Database** (authorization) - stores role in `users` table

## Sync Process

### Automatic Sync Script

Run the sync script to update all Supabase Auth users with role information:

```bash
cd backend
node scripts/update-supabase-roles.js
```

This script will:
- ✅ Fetch all users from Supabase Auth
- ✅ Sync roles with database users table
- ✅ Update Supabase Auth `user_metadata` with role information
- ✅ Create missing users in database
- ✅ Report any orphaned users

### Manual Update

If you need to manually update a user's role:

#### 1. Update Database
```sql
UPDATE users SET role = 'admin', is_admin = true WHERE email = 'user@example.com';
UPDATE users SET role = 'moderator', is_admin = false WHERE email = 'user@example.com';
UPDATE users SET role = 'user', is_admin = false WHERE email = 'user@example.com';
```

#### 2. Update Supabase Auth Metadata

You can use the Supabase Admin API or Dashboard:

**Via API:**
```javascript
await supabase.auth.admin.updateUserById(userId, {
  user_metadata: {
    role: 'admin',
    is_admin: true
  }
});
```

**Via Supabase Dashboard:**
1. Go to Authentication → Users
2. Click on the user
3. Edit user metadata:
   ```json
   {
     "role": "admin",
     "is_admin": true
   }
   ```

## Role Priority

The system checks roles in this order:
1. **Database `users` table** (primary source)
2. **Supabase Auth `user_metadata.role`** (fallback)
3. **Supabase Auth `user_metadata.is_admin`** (legacy fallback)

## Creating New Users

### Create Admin User

```bash
cd backend
node config/migrate-admin-to-supabase.js
```

### Create Moderator User

1. **Create in Supabase Auth** (via Dashboard or API)
2. **Add to database:**
   ```sql
   INSERT INTO users (email, name, role, is_admin, password)
   VALUES ('moderator@example.com', 'Moderator Name', 'moderator', false, 'supabase_auth');
   ```
3. **Update Supabase Auth metadata:**
   ```javascript
   await supabase.auth.admin.updateUserById(userId, {
     user_metadata: {
       role: 'moderator',
       is_admin: false
     }
   });
   ```

### Or Use Admin API (After Login)

```bash
PUT /api/admin/users/:id/role
{
  "role": "moderator"
}
```

## Troubleshooting

### User Can't Login

1. Check user exists in Supabase Auth
2. Check user exists in database with correct role
3. Run sync script: `node scripts/update-supabase-roles.js`
4. Verify `SUPABASE_SERVICE_ROLE_KEY` is set in backend/.env

### Role Not Working

1. Verify role in database: `SELECT email, role FROM users WHERE email = 'user@example.com'`
2. Check Supabase Auth metadata matches database
3. Clear browser session and login again
4. Check backend logs for role verification

### Orphaned Users

Users in database but not in Supabase Auth cannot login. Create them in Supabase Auth first, then run the sync script.

## Best Practices

1. **Always sync after role changes** - Run `update-supabase-roles.js` after manual updates
2. **Use database as source of truth** - Update database first, then sync to Supabase Auth
3. **Regular syncs** - Run sync script periodically to ensure consistency
4. **Test after changes** - Always test login after role updates

