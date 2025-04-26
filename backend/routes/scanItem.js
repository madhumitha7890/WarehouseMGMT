const express = require("express");
const scanItemApp = express.Router();

let rackCollection, forkLiftCollection;

const itemToZoneMap = {
  bottle: "A",
  watch: "B",
  phone: "C",
};

const FORKLIFT_CAPACITY = 5;

// Middleware to access collections
scanItemApp.use((req, res, next) => {
  rackCollection = req.app.get("rackCollection");
  forkLiftCollection = req.app.get("forkliftCollection");
  next();
});

// Main route
scanItemApp.post("/", async (req, res) => {
  try {
    const io = req.app.get("io");
    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);
    });
    console.log("Socket ID:", io.id);
    console.log(req.body)
    const itemType = req.body.itemType;
    const zone = itemToZoneMap[itemType?.toLowerCase()];
    console.log(zone)
    if (!zone) {
      return res.status(400).json({ error: "Invalid Item Type" });
    }
    
    const rack = await rackCollection.findOneAndUpdate(
      { zone: zone, status: "empty" },
      { $set: { status: "assigned" } },
      { sort: { _id: 1 }, returnDocument: "after" }
    );

    console.log('rack: ',rack)
    if (!rack) {
      return res.status(404).json({ error: "No empty rack found in this zone" });
    }

    const itemData = {
      itemID: Date.now(),
      itemType,
      name: itemType,
      zone,
      assignedRackId: rack._id,
      timestamp: Date.now(),
    };

    io.emit("item_scanned", itemData);
    console.log("Item scanned")
    const updateResult = await forkLiftCollection.updateOne(
      { zone: zone, status: "AT_STATION" },
      {
        $push: { currentLoad: itemData },
        $set: { lastActivityTimestamp: Date.now() },
      }
    );
    console.log('updateResult',updateResult)
    if (updateResult.modifiedCount > 0) {
        console.log("Item added to stack")
      io.emit("item_added_to_stack", { zone: zone, item: itemData });

      const updatedForklift = await forkLiftCollection.findOne({ zone: zone, status: "AT_STATION" });

      if (updatedForklift?.currentLoad?.length >= FORKLIFT_CAPACITY) {
        io.emit("forklift_ready_to_leave", {
          zone,
          currentLoad: updatedForklift.currentLoad,
        });
      }

      res.status(200).json({ message: "Item scanned successfully", item: itemData });
    } else {
      res.status(500).json({ error: "Failed to update forklift collection" });
    }
  } catch (err) {
    console.error("Error in scan-item API:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = scanItemApp;
