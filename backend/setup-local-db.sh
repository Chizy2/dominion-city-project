#!/bin/bash
echo "🚀 Setting up local database..."

# Try to create database
createdb dominion_city 2>/dev/null && echo "✅ Database created" || echo "⚠️  Database might already exist"

# Run schema
psql dominion_city < backend/config/db-init.sql && echo "✅ Schema loaded" || echo "❌ Schema already loaded"

# Create admin user
cd backend && npm run init-db && echo "✅ Admin user created" || echo "❌ Admin user setup failed"
