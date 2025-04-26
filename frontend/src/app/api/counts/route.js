import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "inventory";
const collectionName = process.env.COLLECTION_NAME || "stock";

export async function GET() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName);
    const counts = await collection.findOne({ type: "available" });
    const sold = await collection.findOne({ type: "orders" });

    return new Response(
      JSON.stringify({ success: true, counts, orders: sold }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("DB Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Database fetch failed",
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await client.close();
  }
}
