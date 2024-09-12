const Anthropic = require("@anthropic-ai/sdk");
const { HNSWLib } = require("langchain/vectorstores/hnswlib");
const { CohereEmbeddings } = require("langchain/embeddings/cohere");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const fs = require("fs").promises;
const Document = require("../models/Document");

console.log(
  "ANTHROPIC_API_KEY:",
  process.env.ANTHROPIC_API_KEY ? "Set" : "Not set"
);
console.log("COHERE_API_KEY:", process.env.COHERE_API_KEY ? "Set" : "Not set");

if (!process.env.COHERE_API_KEY) {
  throw new Error("COHERE_API_KEY is not set in the environment variables");
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const cohereEmbeddings = new CohereEmbeddings({
  apiKey: process.env.COHERE_API_KEY,
});

const processDocument = async (filePath) => {
  const content = await fs.readFile(filePath, "utf8");
  return content;
};

const vectorizeDocument = async (documentId) => {
  const document = await Document.findById(documentId);
  if (!document) throw new Error("Document not found");

  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
  const docs = await textSplitter.createDocuments([document.content]);

  const vectorStore = await HNSWLib.fromDocuments(docs, cohereEmbeddings);

  document.vectorized = true;
  await document.save();

  return vectorStore;
};

const queryDocument = async (documentId, query) => {
  const document = await Document.findById(documentId);
  if (!document) throw new Error("Document not found");

  if (!document.vectorized) {
    await vectorizeDocument(documentId);
  }

  const vectorStore = await vectorizeDocument(documentId);
  const relevantDocs = await vectorStore.similaritySearch(query, 3);

  const context = relevantDocs.map((doc) => doc.pageContent).join("\n\n");

  const response = await anthropic.completions.create({
    model: "claude-3-sonnet-20240229",
    max_tokens: 300,
    messages: [
      { role: "user", content: `Context: ${context}\n\nHuman: ${query}` },
    ],
  });

  return response.completion;
};

module.exports = { processDocument, queryDocument };
