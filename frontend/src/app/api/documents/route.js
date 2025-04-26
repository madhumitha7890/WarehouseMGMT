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

export async function POST(request) {
  const client = new MongoClient(uri);
  
  try {
    const { check_out, id, label } = await request.json();
    
    if (!id || !label) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Missing required fields: id and label are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName);
    const stockCollection = database.collection("stock");
    
    // Start a session for transaction
    const session = client.startSession();
    
    let transactionResult;
    
    try {
      // Start transaction
      transactionResult = await session.withTransaction(async () => {
        // 1. Update the item document with checkout info
        const documentId = +id;
        const itemResult = await collection.updateOne(
          { id: documentId },
          { $set: { check_out } },
          { session }
        );
        
        if (itemResult.matchedCount === 0) {
          // Abort transaction if item not found
          throw new Error(`Item with id ${id} not found`);
        }
        
        // 2. Increment the orders count for this item type
        const ordersResult = await stockCollection.updateOne(
          { type: "orders" },
          { $inc: { [label]: 1 } },
          { session }
        );
        
        if (ordersResult.matchedCount === 0) {
          throw new Error("Orders document not found in stock collection");
        }
        
        // 3. Decrement the available count for this item type
        const availableResult = await stockCollection.updateOne(
          { type: "available" },
          { $inc: { [label]: -1 } },
          { session }
        );
        
        if (availableResult.matchedCount === 0) {
          throw new Error("Available document not found in stock collection");
        }
        
        // 4. Get the updated stock information
        const availableDoc = await stockCollection.findOne(
          { type: "available" },
          { session }
        );
        
        // 5. Check if available count has gone below 0
        if (availableDoc[label] < 0) {
          throw new Error(`Cannot checkout ${label}: Out of stock`);
        }
        
        return { itemResult, ordersResult, availableResult };
      });
      
    } finally {
      await session.endSession();
    }
    
    // If transaction was aborted or failed
    if (!transactionResult) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Transaction failed or was aborted'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Calculate updated market demand
    const availableDoc = await stockCollection.findOne({ type: "available" });
    const ordersDoc = await stockCollection.findOne({ type: "orders" });
    
    // Calculate demand for the specific item
    let demand = null;
    if (ordersDoc[label] !== 0) {
      const inventory = availableDoc[label];
      const orders = ordersDoc[label];
      demand = inventory * (inventory / orders) - orders;
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: `${label} checked out successfully`,
      updatedStock: {
        available: availableDoc[label],
        orders: ordersDoc[label],
        demand: demand !== null ? Math.round(demand * 100) / 100 : 'N/A (no orders)'
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Checkout Error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: error.message || 'Database update failed',
      error: error.toString(),
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await client.close();
  }
}