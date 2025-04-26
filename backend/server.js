// server.js
const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const client = new MongoClient(uri);
const dbName = process.env.DB_NAME || "inventory";
const collectionName = process.env.COLLECTION_NAME || "items_collection";

// API endpoint to fetch all documents
app.get("/api/items", async (req, res) => {
  try {
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    // Fetch all documents
    const documents = await collection.find({}).toArray();

    res.json({ success: true, data: documents });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch documents",
        error: error.message,
      });
  } finally {
    // Close the connection when done
    await client.close();
  }
});

app.post("/api/items", async (req, res) => {
  try {
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    // Insert a new document
    const result = await collection.insertOne(req.body);

    res.status(201).json({ success: true, data: result.ops[0] });
  } catch (error) {
    console.error("Error inserting document:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to insert document",
        error: error.message,
      });
  } finally {
    // Close the connection when done
    await client.close();
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
