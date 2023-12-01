module.exports = {
  apps: [
    {
      name: "expressjs_backend",
      script: "build/index.js",
      env: {
        NODE_ENV: "production",
      },
      env_file: "./.env",
    },
  ],
};
