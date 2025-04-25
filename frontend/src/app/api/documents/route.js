import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'inventory';
const collectionName = process.env.COLLECTION_NAME || 'items_collection';

export async function GET() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName);
    const documents = await collection.find({}).toArray();

    return new Response(JSON.stringify({ success: true, data: documents }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('DB Error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Database fetch failed',
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await client.close();
  }
}
