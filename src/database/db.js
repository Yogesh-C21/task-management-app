const mongoose = require("mongoose");
const config = require("../config/config");

class Database {
  constructor() {
    this.databaseUri = config.getDatabaseUri();
  }
  async connect() {
    return new Promise((resolve, reject) => {
      mongoose
        .connect(this.databaseUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        })
        .then(() => {
          console.log("Connected to MongoDB");
          resolve("Connected to MongoDB"); // Notify success
        })
        .catch((err) => {
          console.error("MongoDB connection error:", err);
          reject(err); // Notify failure
        });
    });
  }
  async disconnect() {
    await mongoose.disconnect();
  }
}

module.exports = new Database();
