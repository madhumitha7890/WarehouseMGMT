const { MongoClient } = require("mongodb");
require("dotenv").config();
// Replace with your actual MongoDB connection string
const uri = process.env.MONGODB_URI; 
const dbName = "inventory"; // Replace with your DB name

async function initializeRacks(rackCollection) {
  const zones = ["A", "B", "C"];
  const racks = [];

  zones.forEach((zone) => {
    for (let i = 1; i <= 20; i++) {
      const rackId = `${zone}${i.toString().padStart(2, "0")}`;
      racks.push({
        _id: rackId,
        zone: zone,
        status: "empty",
        currentItem: null,
      });
    }
  });

  await rackCollection.deleteMany({});
  await rackCollection.insertMany(racks);
  console.log("✅ Racks collection initialized.");
}

async function initializeForklifts(forkliftCollection) {
  const zones = ["A", "B", "C"];
  const forklifts = zones.map((zone) => ({
    _id: `Forklift-${zone}`,
    zone: zone,
    status: "AT_STATION",
    currentLoad: [],
    lastActivityTimestamp: Date.now(),
  }));

  await forkliftCollection.deleteMany({});
  await forkliftCollection.insertMany(forklifts);
  console.log("✅ Forklifts collection initialized.");
}

async function resetDatabase() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const rackCollection = db.collection("racks");
    const forkliftCollection = db.collection("forklifts");

    await initializeRacks(rackCollection);
    await initializeForklifts(forkliftCollection);

    console.log("✅ Database reset complete.");
  } catch (err) {
    console.error("❌ Error during reset:", err);
  } finally {
    await client.close();
  }
}

resetDatabase();
