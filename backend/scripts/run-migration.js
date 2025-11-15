// This script is now a wrapper that calls the simpler migration script
// The simpler version handles SQL execution more reliably

require('dotenv').config();
const { exec } = require('child_process');
const path = require('path');

console.log('🔄 Running role-based access control migration...\n');
console.log('Using simplified migration script...\n');

const migrationScript = path.join(__dirname, 'run-migration-simple.js');

exec(`node ${migrationScript}`, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
  
  if (stderr) {
    console.error('⚠️  Warnings:', stderr);
  }
  
  console.log(stdout);
  process.exit(0);
});

