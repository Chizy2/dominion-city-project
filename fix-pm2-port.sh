#!/bin/bash

# Fix PM2 Port 5050 Error - Run this on your VPS

echo "🔧 Fixing PM2 port configuration..."

# Step 1: Stop and delete the old process
echo "1. Stopping and removing old PM2 process..."
pm2 stop dominion-backend 2>/dev/null
pm2 delete dominion-backend 2>/dev/null

# Step 2: Kill anything using port 5050
echo "2. Killing processes on port 5050..."
sudo lsof -ti:5050 | xargs sudo kill -9 2>/dev/null || echo "   No process found on port 5050"

# Step 3: Check if backend/.env exists and update PORT
echo "3. Checking backend/.env file..."
if [ -f "backend/.env" ]; then
    # Update PORT to 5051 if it's set to 5050
    sed -i 's/^PORT=5050$/PORT=5051/' backend/.env
    # Ensure NODE_ENV is set to production
    if ! grep -q "^NODE_ENV=production" backend/.env; then
        # Add or update NODE_ENV
        if grep -q "^NODE_ENV=" backend/.env; then
            sed -i 's/^NODE_ENV=.*/NODE_ENV=production/' backend/.env
        else
            echo "NODE_ENV=production" >> backend/.env
        fi
    fi
    echo "   ✅ Updated backend/.env"
else
    echo "   ⚠️  backend/.env not found - you may need to create it"
fi

# Step 4: Start PM2 with correct settings
echo "4. Starting PM2 with correct configuration..."
cd backend
PORT=5051 NODE_ENV=production pm2 start server.js --name dominion-backend --update-env

# Step 5: Save PM2 configuration
echo "5. Saving PM2 configuration..."
pm2 save

# Step 6: Show status
echo ""
echo "✅ Done! PM2 status:"
pm2 status

echo ""
echo "📋 Recent logs:"
pm2 logs dominion-backend --lines 10 --nostream

