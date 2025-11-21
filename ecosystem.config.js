module.exports = {
  apps: [
    {
      name: 'dominion-backend',
      script: './backend/server.js',
      cwd: '/var/www/dominion-city-project', // Update this to your actual project path
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5051,
        // Add your other environment variables here
        // DATABASE_URL: 'your_database_url',
        // SUPABASE_URL: 'https://ussoyjjlauhggwsezbhy.supabase.co',
        // SUPABASE_SERVICE_ROLE_KEY: 'your_service_role_key',
        // FRONTEND_URL: 'https://dcdirect.online',
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
    {
      name: 'dominion-frontend',
      script: './frontend/server.js',
      cwd: '/var/www/dominion-city-project', // Update this to your actual project path
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        // Add your frontend environment variables here
        // NEXT_PUBLIC_API_URL: 'https://dcdirect.online/api',
        // NEXT_PUBLIC_SUPABASE_URL: 'https://ussoyjjlauhggwsezbhy.supabase.co',
        // NEXT_PUBLIC_SUPABASE_ANON_KEY: 'your_anon_key',
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
};

