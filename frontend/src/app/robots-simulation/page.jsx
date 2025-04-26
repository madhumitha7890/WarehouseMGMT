// pages/index.jsx
"use client";

import { useState } from "react";
import LastScannedItem from "../../components/robotsPageComponents/LastScannedItem";
import ForkliftZone from "../../components/robotsPageComponents/ForkliftZone";
import ConnectionStatus from "../../components/robotsPageComponents/ConnectionStatus";
import useSocketConnection from "../../hooks/useSocketConnection";

export default function Home() {
  const {
    isConnected,
    lastScannedItem,
    forkliftStacks,
    forkliftStatus,
    forkliftPositions,
    forkliftDirections,
    placementLogs,
    requestItemScan,
  } = useSocketConnection();

  const [selectedItemType, setSelectedItemType] = useState("bottle");

 
  const handleManualScan = () => {
    // This would just trigger your API to simulate a scan
    // Your backend would determine what item was scanned
    requestItemScan()
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Warehouse Management System</h1>

      {/* Just a Manual Scan button for testing */}
      {/* <div className="flex justify-center mb-6">
        <button 
          onClick={handleManualScan}
          className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-medium"
        >
          Manual Scan (Test)
        </button>
      </div> */}
      
      {/* Last Scanned Item Section */}
      <LastScannedItem item={lastScannedItem} />

      {/* Zone Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Zone A: Bottles */}
        <ForkliftZone
          zone="A"
          status={forkliftStatus["A"]}
          stack={forkliftStacks["A"]}
          position={forkliftPositions["A"]}
          direction={forkliftDirections["A"]}
          logs={placementLogs["A"]}
        />

        {/* Zone B: Watches */}
        <ForkliftZone
          zone="B"
          status={forkliftStatus["B"]}
          stack={forkliftStacks["B"]}
          position={forkliftPositions["B"]}
          direction={forkliftDirections["B"]}
          logs={placementLogs["B"]}
        />

        {/* Zone C: Phones */}
        <ForkliftZone
          zone="C"
          status={forkliftStatus["C"]}
          stack={forkliftStacks["C"]}
          position={forkliftPositions["C"]}
          direction={forkliftDirections["C"]}
          logs={placementLogs["C"]}
        />
      </div>

      {/* Connection Status */}
      <ConnectionStatus isConnected={isConnected} />
    </div>
  );
}
