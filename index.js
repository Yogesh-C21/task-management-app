const app = require("./src/express");
const Database = require("./src/database/db");
const config = require("./src/config/config");

const startServer = async () => {
  try {
    await Database.connect();
    const PORT = config.getPort();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(
      "Failed to start the server due to database connection error:",
      error
    );
    process.exit(1);
  }
};

startServer();
