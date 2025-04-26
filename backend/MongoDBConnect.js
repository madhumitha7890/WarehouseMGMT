// db.js
const { MongoClient } = require('mongodb');
require('dotenv').config();
const MONGO_URI = process.env.MONGODB_URI
const client = new MongoClient(MONGO_URI);
const dbName = 'inventory';

async function connectToDatabase() {
  await client.connect();
  const db = client.db(dbName);

  // Access collections
  const rackCollection = db.collection('racks')
  const forkLiftCollection = db.collection('forklifts');

  return {
    db,
    collections: {
      rackCollection: rackCollection,
      forkLiftCollection: forkLiftCollection,
    }
  };
}

module.exports = connectToDatabase;
