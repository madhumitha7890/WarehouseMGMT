// // hooks/useSocketConnection.js
// import { useState, useEffect, useCallback } from "react";
// import io from "socket.io-client";

// const useSocketConnection = () => {
//   const [socket, setSocket] = useState(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const [lastScannedItem, setLastScannedItem] = useState(null);
//   const [forkliftStacks, setForkliftStacks] = useState({
//     A: [],
//     B: [],
//     C: [],
//   });
//   const [forkliftStatus, setForkliftStatus] = useState({
//     A: "AT_STATION",
//     B: "AT_STATION",
//     C: "AT_STATION",
//   });
//   const [forkliftPositions, setForkliftPositions] = useState({
//     A: 0,
//     B: 0,
//     C: 0,
//   });
//   const [forkliftDirections, setForkliftDirections] = useState({
//     A: "forward",
//     B: "forward",
//     C: "forward",
//   });
//   const [placementLogs, setPlacementLogs] = useState({
//     A: [],
//     B: [],
//     C: [],
//   });
//   const [occupiedRacks, setOccupiedRacks] = useState({
//     A: new Set(),
//     B: new Set(),
//     C: new Set(),
//   });

//   // Initialize socket connection
//   useEffect(() => {
//     const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000");

//     newSocket.on("connect", () => {
//       console.log("Socket connected!");
//       setIsConnected(true);
//     });

//     newSocket.on("disconnect", () => {
//       console.log("Socket disconnected!");
//       setIsConnected(false);
//     });

//     setSocket(newSocket);

//     return () => {
//       newSocket.disconnect();
//     };
//   }, []);

//   // Handle socket events
//   useEffect(() => {
//     if (!socket) return;

//     // Handle item scanned event
//     socket.on("item_scanned", (item) => {
//       console.log("Item scanned:", item);
//       setLastScannedItem(item);
//     });

//     // Handle item added to stack event
//     socket.on("item_added_to_stack", ({ zone, item }) => {
//       console.log(`Item added to ${zone} stack:`, item);
//       setForkliftStacks((prev) => ({
//         ...prev,
//         [zone]: [...prev[zone], item],
//       }));

//       // Mark rack as occupied
//       setOccupiedRacks((prev) => {
//         const updatedRacks = { ...prev };
//         updatedRacks[zone] = new Set(updatedRacks[zone]);
//         updatedRacks[zone].add(item.assignedRackId);
//         return updatedRacks;
//       });
//     });

//     // Handle forklift ready to leave event
//     socket.on("forklift_ready_to_leave", ({ zone, currentLoad }) => {
//       console.log(`Forklift ${zone} ready to leave with load:`, currentLoad);
//       startForkliftCycle(zone);
//     });

//     // Handle forklift at zone event
//     socket.on("forklift_at_zone", ({ zone, items }) => {
//       console.log(`Forklift ${zone} arrived at zone with items:`, items);
//       setForkliftStatus((prev) => ({
//         ...prev,
//         [zone]: "PLACING_ITEMS",
//       }));

//       // Start placing items
//       placeItems(zone, items);
//     });

//     // Handle forklift returned event
//     socket.on("forklift_returned", ({ zone }) => {
//       console.log(`Forklift ${zone} returned to station`);
//       setForkliftStatus((prev) => ({
//         ...prev,
//         [zone]: "AT_STATION",
//       }));

//       // Clear placement logs
//       setPlacementLogs((prev) => ({
//         ...prev,
//         [zone]: [],
//       }));
//     });

//     return () => {
//       socket.off("item_scanned");
//       socket.off("item_added_to_stack");
//       socket.off("forklift_ready_to_leave");
//       socket.off("forklift_at_zone");
//       socket.off("forklift_returned");
//     };
//   }, [socket]);

//   // Manual scan function
//   // From the useSocketConnection hook
//   const requestItemScan = useCallback(async () => {
//     // try {
//     //   const response = await fetch("/api/scan-item", {
//     //     method: "POST",
//     //   });

//     //   if (!response.ok) {
//     //     console.error("Failed to scan item:", await response.text());
//     //   }
//     // } catch (error) {
//     //   console.error("Error scanning item:", error);
//     // }/

//     console.log("Scanning stated")
//   }, []);

//   // Start forklift cycle (movement to zone)
//   const startForkliftCycle = useCallback((zone) => {
//     // Update forklift status to moving
//     setForkliftStatus((prev) => ({
//       ...prev,
//       [zone]: "MOVING_TO_ZONE",
//     }));

//     // Set direction to forward (towards inventory)
//     setForkliftDirections((prev) => ({
//       ...prev,
//       [zone]: "forward",
//     }));

//     // Start forklift animation
//     startForkliftAnimation(zone, "forward");

//     // Clear the visual stack immediately (replacement forklift)
//     setForkliftStacks((prev) => ({
//       ...prev,
//       [zone]: [],
//     }));
//   }, []);

//   // Start forklift animation
//   const startForkliftAnimation = useCallback((zone, direction) => {
//     let animationInterval;

//     // Set initial position if needed
//     if (direction === "forward") {
//       setForkliftPositions((prev) => ({
//         ...prev,
//         [zone]: 0, // Starting at station
//       }));
//     } else {
//       setForkliftPositions((prev) => ({
//         ...prev,
//         [zone]: 100, // Starting at inventory zone
//       }));
//     }

//     // Animation interval
//     animationInterval = setInterval(() => {
//       setForkliftPositions((prev) => {
//         const currentPos = prev[zone];
//         let newPos;

//         if (direction === "forward") {
//           newPos = currentPos + 1;
//           if (newPos >= 100) {
//             // Reached inventory zone
//             clearInterval(animationInterval);
//             return { ...prev, [zone]: 100 };
//           }
//         } else {
//           newPos = currentPos - 1;
//           if (newPos <= 0) {
//             // Reached station
//             clearInterval(animationInterval);
//             return { ...prev, [zone]: 0 };
//           }
//         }

//         return { ...prev, [zone]: newPos };
//       });
//     }, 80); // Adjust speed of animation here

//     return () => {
//       if (animationInterval) clearInterval(animationInterval);
//     };
//   }, []);

//   // Place items one by one in the zone
//   const placeItems = useCallback(
//     (zone, items) => {
//       if (!items || items.length === 0) {
//         // All items placed, forklift returns
//         setForkliftStatus((prev) => ({
//           ...prev,
//           [zone]: "RETURNING",
//         }));

//         // Set direction to backward (towards station)
//         setForkliftDirections((prev) => ({
//           ...prev,
//           [zone]: "backward",
//         }));

//         // Start return animation
//         startForkliftAnimation(zone, "backward");

//         return;
//       }

//       const itemsToPlace = [...items];
//       const placeNextItem = () => {
//         if (itemsToPlace.length === 0) {
//           // All items placed, forklift returns
//           setForkliftStatus((prev) => ({
//             ...prev,
//             [zone]: "RETURNING",
//           }));

//           // Set direction to backward (towards station)
//           setForkliftDirections((prev) => ({
//             ...prev,
//             [zone]: "backward",
//           }));

//           // Start return animation
//           startForkliftAnimation(zone, "backward");

//           return;
//         }

//         // Take the next item to place
//         const item = itemsToPlace.shift();

//         // Create placement log message
//         const displayId = item.itemID;
//         const logMessage = `Placed ${item.name} (ID: ${displayId}) in Rack ${item.assignedRackId}`;

//         // Generate a unique log key
//         const logKey = `log-${zone}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

//         // Update placement logs with unique key
//         setPlacementLogs((prev) => {
//           const updatedLogs = { ...prev };
//           updatedLogs[zone] = [...updatedLogs[zone], { message: logMessage, key: logKey }];
//           return updatedLogs;
//         });

//         // Place next item after 2 seconds
//         setTimeout(placeNextItem, 2000);
//       };

//       // Start placing items
//       placeNextItem();
//     },
//     [startForkliftAnimation]
//   );

//   return {
//     socket,
//     isConnected,
//     lastScannedItem,
//     forkliftStacks,
//     forkliftStatus,
//     forkliftPositions,
//     forkliftDirections,
//     placementLogs,
//     occupiedRacks,
//     requestItemScan,
//   };
// };

// export default useSocketConnection;

import { useState, useEffect, useCallback } from "react";
import io from "socket.io-client";

const FORKLIFT_CAPACITY = 5;

const useSocketConnection = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastScannedItem, setLastScannedItem] = useState(null);
  const [forkliftStacks, setForkliftStacks] = useState({
    A: [],
    B: [],
    C: [],
  });
  const [forkliftStatus, setForkliftStatus] = useState({
    A: "AT_STATION",
    B: "AT_STATION",
    C: "AT_STATION",
  });
  const [forkliftPositions, setForkliftPositions] = useState({
    A: 0,
    B: 0,
    C: 0,
  });
  const [forkliftDirections, setForkliftDirections] = useState({
    A: "forward",
    B: "forward",
    C: "forward",
  });
  const [placementLogs, setPlacementLogs] = useState({
    A: [],
    B: [],
    C: [],
  });
  const [occupiedRacks, setOccupiedRacks] = useState({
    A: new Set(),
    B: new Set(),
    C: new Set(),
  });

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000");

    newSocket.on("connect", () => {
      console.log("Socket connected!");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected!");
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Handle socket events
  useEffect(() => {
    if (!socket) return;

    // Handle item scanned event
    socket.on("item_scanned", (item) => {
      console.log("Item scanned:", item);
      setLastScannedItem(item);
    });

    // Handle item added to stack event
    socket.on("item_added_to_stack", ({ zone, item }) => {
      console.log(`Item added to ${zone} stack:`, item);

      // Add item to forklift stack
      setForkliftStacks((prev) => {
        const newStack = [...prev[zone], item];

        // Check if capacity reached and forklift is at station
        if (newStack.length >= FORKLIFT_CAPACITY && forkliftStatus[zone] === "AT_STATION") {
          // Trigger forklift cycle immediately
          setTimeout(() => {
            startForkliftCycle(zone, newStack);
          }, 0);
        }

        return {
          ...prev,
          [zone]: newStack,
        };
      });

      // Mark rack as occupied
      setOccupiedRacks((prev) => {
        const updatedRacks = { ...prev };
        updatedRacks[zone] = new Set(updatedRacks[zone]);
        updatedRacks[zone].add(item.assignedRackId);
        return updatedRacks;
      });
    });

    // These events are still registered but we'll handle the logic ourselves
    socket.on("forklift_ready_to_leave", ({ zone, currentLoad }) => {
      console.log(`Forklift ${zone} ready to leave with load:`, currentLoad);
      // Logic now handled in item_added_to_stack
    });

    socket.on("forklift_at_zone", ({ zone, items }) => {
      console.log(`Forklift ${zone} arrived at zone with items:`, items);
      // Logic now handled in startForkliftCycle
    });

    socket.on("forklift_returned", ({ zone }) => {
      console.log(`Forklift ${zone} returned to station`);
      // Logic now handled in placeItems
    });

    return () => {
      socket.off("item_scanned");
      socket.off("item_added_to_stack");
      socket.off("forklift_ready_to_leave");
      socket.off("forklift_at_zone");
      socket.off("forklift_returned");
    };
  }, [socket, forkliftStatus]);

  // Manual scan function
  const requestItemScan = useCallback(async () => {
    try {
      const response = await fetch("/api/scan-item", {
        method: "POST",
      });

      if (!response.ok) {
        console.error("Failed to scan item:", await response.text());
      }
    } catch (error) {
      console.error("Error scanning item:", error);
    }
  }, []);

  // Start forklift cycle (movement to zone)
  const startForkliftCycle = useCallback((zone, items) => {
    console.log(`Starting forklift cycle for zone ${zone} with ${items.length} items`);

    // Update forklift status to moving
    setForkliftStatus((prev) => ({
      ...prev,
      [zone]: "MOVING_TO_ZONE",
    }));

    // Set direction to forward (towards inventory)
    setForkliftDirections((prev) => ({
      ...prev,
      [zone]: "forward",
    }));

    // Clear the stack to allow for more items
    setForkliftStacks((prev) => ({
      ...prev,
      [zone]: [],
    }));

    // Animation takes about 2 seconds to complete
    const animationDuration = 4000;
    const animationInterval = 20; // 20ms between position updates
    const steps = animationDuration / animationInterval;
    const stepIncrement = 100 / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;

      // Update position
      const newPosition = currentStep * stepIncrement;
      setForkliftPositions((prev) => ({
        ...prev,
        [zone]: Math.min(newPosition, 100),
      }));

      // Check if animation complete
      if (newPosition >= 100) {
        clearInterval(interval);

        // Start placing items when forklift reaches destination
        setTimeout(() => {
          setForkliftStatus((prev) => ({
            ...prev,
            [zone]: "PLACING_ITEMS",
          }));

          placeItems(zone, items);
        }, 100);
      }
    }, animationInterval);
  }, []);

  // Place items one by one in the zone
  const placeItems = useCallback((zone, items) => {
    if (!items || items.length === 0) {
      returnForklift(zone);
      return;
    }

    // Calculate timing for placement
    const totalPlacementTime = 4000; // 2 seconds for placing all items
    const delayPerItem = totalPlacementTime / items.length;

    // Place each item with a delay
    items.forEach((item, index) => {
      setTimeout(() => {
        // Create placement log message
        const displayId = item.itemID;
        const logMessage = `Placed ${item.name} (ID: ${displayId}) in Rack ${item.assignedRackId}`;
        const logKey = `log-${zone}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Update placement logs
        setPlacementLogs((prev) => {
          const updatedLogs = { ...prev };
          updatedLogs[zone] = [...updatedLogs[zone], { message: logMessage, key: logKey }];
          return updatedLogs;
        });

        // If this is the last item, start return journey after a short delay
        if (index === items.length - 1) {
          setTimeout(() => {
            returnForklift(zone);
          }, 500); // Small delay after last item is placed
        }
      }, index * delayPerItem);
    });
  }, []);

  // Return forklift to station
  const returnForklift = useCallback((zone) => {
    setForkliftStatus((prev) => ({
      ...prev,
      [zone]: "RETURNING",
    }));

    // Set direction to backward (towards station)
    setForkliftDirections((prev) => ({
      ...prev,
      [zone]: "backward",
    }));

    // Animation takes about 1 second to complete
    const animationDuration = 2000;
    const animationInterval = 20; // 20ms between position updates
    const steps = animationDuration / animationInterval;
    const stepDecrement = 100 / steps;

    let currentPosition = 100; // Start from zone (100%)
    const interval = setInterval(() => {
      currentPosition -= stepDecrement;

      // Update position
      setForkliftPositions((prev) => ({
        ...prev,
        [zone]: Math.max(currentPosition, 0),
      }));

      // Check if animation complete
      if (currentPosition <= 0) {
        clearInterval(interval);

        // Reset forklift status when it reaches station
        setTimeout(() => {
          setForkliftStatus((prev) => ({
            ...prev,
            [zone]: "AT_STATION",
          }));

          // Clear placement logs
          setPlacementLogs((prev) => ({
            ...prev,
            [zone]: [],
          }));

          // Do an API call to clear the currentLoad in the database
          updateForkliftInDatabase(zone);
        }, 100);
      }
    }, animationInterval);
  }, []);

  // Update forklift in database to clear currentLoad
  const updateForkliftInDatabase = useCallback(async (zone) => {
    try {
      // In a real implementation, you'd make an API call here
      console.log(`Updating forklift ${zone} in database - clearing currentLoad`);

      // Example API call (commented out)
      /*
      const response = await fetch("/api/forklift/clear-load", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ zone }),
      });

      if (!response.ok) {
        console.error("Failed to clear forklift load:", await response.text());
      }
      */
    } catch (error) {
      console.error(`Error clearing forklift ${zone} load:`, error);
    }
  }, []);

  return {
    socket,
    isConnected,
    lastScannedItem,
    forkliftStacks,
    forkliftStatus,
    forkliftPositions,
    forkliftDirections,
    placementLogs,
    occupiedRacks,
    requestItemScan,
  };
};

export default useSocketConnection;
