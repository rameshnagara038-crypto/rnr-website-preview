// Website/ecosystem.config.cjs
module.exports = {
  apps: [
    // --- App 1: The Frontend React App ---
    {
      name: 'rnr-website-frontend', // Renamed for clarity
      script: 'npm',
      args: 'run serve',
      cwd: __dirname,
      watch: false,
      autorestart: true,
      env: {
        NODE_ENV: 'production',
      },
    },
    // --- App 2: The New Backend Server ---
    {
      name: 'rnr-website-backend',
      script: 'server.js', // Directly run the server file
      cwd: __dirname,
      watch: false,
      autorestart: true,
      env: {
        NODE_ENV: 'production',
      },
    }
  ],
};
