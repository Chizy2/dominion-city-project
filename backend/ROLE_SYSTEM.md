# Role-Based Access Control System

## Overview

The Business Directory now implements a comprehensive role-based access control (RBAC) system with three distinct roles: **Admin**, **Moderator**, and **User**.

## Roles & Permissions

### 👑 Admin
- ✅ Add, edit, and **delete** business listings
- ✅ **Approve/reject** business listings
- ✅ Create and manage categories
- ✅ Add or remove moderators
- ✅ Full access to dashboard
- ✅ User management (view and change roles)

### 🛡️ Moderator
- ✅ Add and edit business listings
- ❌ Cannot delete listings
- ❌ Cannot approve listings (creates as pending)
- ❌ Cannot create/assign moderators or admins
- ✅ View all businesses including pending ones

### 👤 User / Business Owner
- ✅ Can only **view** the directory (read-only)
- ❌ Cannot add or edit listings

## Setup Instructions

### 1. Run Database Migration

Run the migration script to add role columns and approval status:

```bash
cd backend
node scripts/run-migration.js
```

Or manually run the SQL:

```bash
psql -d your_database -f config/migration-add-roles.sql
```

### 2. Update Existing Users

After migration, update existing admin users in your database:

```sql
UPDATE users SET role = 'admin' WHERE is_admin = true;
UPDATE users SET role = 'user' WHERE is_admin = false;
```

### 3. Create Moderator Users

To create a moderator, first add them to Supabase Auth, then:

```sql
INSERT INTO users (email, name, role, is_admin) 
VALUES ('moderator@example.com', 'Moderator Name', 'moderator', false);
```

Or use the admin API endpoint (after logging in as admin):

```bash
PUT /api/admin/users/:id/role
{
  "role": "moderator"
}
```

## API Endpoints

### Admin Routes (`/api/admin/*`)
All routes require **Admin** authentication.

- `GET /api/admin/businesses` - List all businesses
- `POST /api/admin/businesses` - Create business (auto-approved)
- `PUT /api/admin/businesses/:id` - Update business
- `DELETE /api/admin/businesses/:id` - **Delete business** (Admin only)
- `POST /api/admin/businesses/:id/approve` - **Approve business** (Admin only)
- `POST /api/admin/businesses/:id/reject` - **Reject business** (Admin only)
- `GET /api/admin/businesses/pending` - Get pending businesses (Admin only)
- `GET /api/admin/users` - List all users (Admin only)
- `PUT /api/admin/users/:id/role` - Change user role (Admin only)

### Moderator Routes (`/api/moderator/*`)
All routes require **Moderator or Admin** authentication.

- `GET /api/moderator/businesses` - List all businesses (including pending)
- `POST /api/moderator/businesses` - Create business (created as pending)
- `PUT /api/moderator/businesses/:id` - Update business (cannot change approval status)

### Public Routes (`/api/businesses/*`)
No authentication required. Only shows **approved** businesses.

- `GET /api/businesses` - List approved businesses
- `GET /api/businesses/:id` - Get approved business
- `GET /api/businesses/featured/list` - Get featured approved businesses
- `GET /api/businesses/meta/categories` - Get categories (only approved)
- `GET /api/businesses/meta/cities` - Get cities (only approved)

## Business Approval Workflow

1. **Moderator creates business** → Business is created with `approved = false`
2. **Admin reviews** → Admin views pending businesses via `/api/admin/businesses/pending`
3. **Admin approves** → Admin calls `/api/admin/businesses/:id/approve`
4. **Business goes live** → Business now appears in public directory

## User Management

### Assigning Roles (Admin Only)

```bash
# Make user a moderator
PUT /api/admin/users/:userId/role
{
  "role": "moderator"
}

# Make user an admin
PUT /api/admin/users/:userId/role
{
  "role": "admin"
}

# Demote to regular user
PUT /api/admin/users/:userId/role
{
  "role": "user"
}
```

**Note:** Admins cannot demote themselves.

## Frontend Integration

The frontend should check the user's role from the login response:

```javascript
const { user } = await authAPI.login(email, password);
// user.role will be 'admin', 'moderator', or 'user'

// Show/hide features based on role
if (user.role === 'admin') {
  // Show delete button, approval controls, user management
}
if (user.role === 'moderator') {
  // Show add/edit, hide delete and approval
}
if (user.role === 'user') {
  // Read-only access
}
```

## Security Notes

1. **All public routes** only show approved businesses
2. **Moderators** cannot approve businesses (must go through admin)
3. **Regular users** cannot access admin/moderator routes
4. **Role checks** are enforced at both middleware and route level
5. **Self-demotion protection** prevents admins from accidentally removing their own admin access

## Testing

1. Create a test moderator user
2. Login as moderator and create a business
3. Verify business is created as pending
4. Login as admin and approve the business
5. Verify business appears in public directory

## Troubleshooting

### Migration errors
- Check that the `users` table exists
- Verify database connection
- Run migration statements individually if needed

### Role not working
- Check user exists in `users` table
- Verify `role` column exists
- Check Supabase Auth metadata matches database

### Businesses not showing
- Check `approved` column is `true`
- Verify `is_active` is `true`
- Check public routes are filtering correctly

