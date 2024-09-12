const express = require("express");
const multer = require("multer");
const Document = require("../models/Document");
const {
  processDocument,
  queryDocument,
} = require("../services/documentService");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("document"), async (req, res) => {
  try {
    const { title } = req.body;
    const content = await processDocument(req.file.path);
    const document = new Document({ title, content, vectorized: false });
    await document.save();
    res
      .status(201)
      .json({
        message: "Document uploaded successfully",
        documentId: document._id,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error uploading document", error: error.message });
  }
});

router.post("/query", async (req, res) => {
  try {
    const { documentId, query } = req.body;
    const answer = await queryDocument(documentId, query);
    res.json({ answer });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error querying document", error: error.message });
  }
});

module.exports = router;
