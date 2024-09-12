const path = require("path");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });

console.log("Environment variables loaded:", Object.keys(process.env));

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const documentRoutes = require("./routes/documentRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
setTimeout(() => {
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));
}, 5000); // 5 second delay
// Routes
app.use("/api/documents", documentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
