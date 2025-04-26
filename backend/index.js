const express = require("express");
const cors = require("cors");
const connectDB = require("./MongoDBConnect");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const PORT = process.env.PORT;

const app = express();
const server = http.createServer(app); // Create HTTP server manually

const io = new Server(server, {
  cors: {
    origin: "*", // Adjust if needed
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// DB & Dependency setup
async function startServer() {
  const { db, collections } = await connectDB();
  const rackCollection = collections.rackCollection;
  const forkLiftCollection = collections.forkLiftCollection;

  app.set("db", db);
  app.set("rackCollection", rackCollection);
  app.set("forkliftCollection", forkLiftCollection);
  app.set("io", io); // Set socket.io instance for access in routes

  console.log("Connection to DB established and collections set to express app.");
}

startServer().catch((err) => console.error("Error starting server:", err));

// Routes
app.use("/api/scan-item", require("./routes/scanItem"));

// Start server with HTTP instance
server.listen(PORT, () => {
  console.log(`Server running on port:${PORT}`);
});
