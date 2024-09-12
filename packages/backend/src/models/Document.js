const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  title: String,
  content: String,
  vectorized: Boolean,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Document", DocumentSchema);
