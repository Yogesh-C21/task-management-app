module.exports = {
  apps: [
    {
      name: "Task Management",
      script: "./index.js",
      instances: 2,
      exec_mode: "cluster", 
      watch: true,
    },
  ],
};
