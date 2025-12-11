// server.js
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import app from "./app.js";
import config from "./config/index.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const port = config.PORT;

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`API Documentation: http://localhost:${port}/api/health`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
