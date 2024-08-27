// app.js
const express = require("express");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/userRoute");
const taskRoutes = require("./routes/taskRoute");
const RateLimiter = require("./utils/rateLimitHandlers");
const sessionConfig = require("./config/sessionConfig");
const swaggerConfig = require("./config/swaggerConfig");
const helmet = require("helmet");
const cors = require("cors")
const transporter = require("./services/mailService")

const app = express();

// Create a rate limiter with custom settings 10req/s per IP address
const rateLimiter = new RateLimiter(1000, 10).createLimiter();

// Configuring Middleware
app.use(rateLimiter);
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(sessionConfig);
// app.use(cors({
//   origin: 'http://localhost:3000', // modify as per needed for test assignment
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
// }));


// For testing purpose only
app.get("/", async (req, res) => {
  res.status(200).json({ message: 'Test!! Its Working' });
});

app.use("/api-docs", swaggerConfig.serve, swaggerConfig.setup);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);

module.exports = app;
