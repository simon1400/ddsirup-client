module.exports = {
  apps: [
    {
      name: "ddsirup-client",
      script: "npm",
      args: "start",
      cwd: "/opt/ddsirup/client",
      env: {
        NODE_ENV: "production",
        PORT: 3008,
      },
      max_memory_restart: "1G",
      log_date_format: "YYYY-MM-DDTHH:mm:ss",
      out_file: "/var/log/pm2/ddsirup-client-out.log",
      error_file: "/var/log/pm2/ddsirup-client-error.log",
      merge_logs: true,
      time: true,
    },
  ],
};
