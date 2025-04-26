// app/api/scan-item/route.js

import { NextResponse } from "next/server";

// Mapping of item types to zones
const itemToZoneMap = {
  Bottle: "A",
  Watch: "B",
  Phone: "C",
};

// Counter for generated items
let itemCounter = 1;

export async function POST() {
  try {
    // Randomly select an item type
    const itemTypes = ["Bottle", "Watch", "Phone"];
    const randomType = itemTypes[Math.floor(Math.random() * itemTypes.length)];

    // Determine the zone based on item type
    const zone = itemToZoneMap[randomType];

    // Generate a unique item ID
    const itemId = `ITEM-${randomType.charAt(0)}${itemCounter++}`;
    console.log(`Generated item ID: ${itemId}`);
    // Generate rack number (1-20)
    const rackNumber = Math.floor(Math.random() * 20) + 1;
    const rackId = `${zone}${String(rackNumber).padStart(2, "0")}`;

    // Create the new item object
    const newItem = {
      id: itemId,
      type: randomType,
      name: randomType,
      zone: zone,
      assignedRackId: rackId,
      timestamp: Date.now(),
    };

    // Simulate network delay (200-400ms)
    await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 200));

    return NextResponse.json(newItem);
  } catch (error) {
    console.error("Error in scan-item API:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
