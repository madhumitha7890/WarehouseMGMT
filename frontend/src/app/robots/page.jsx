'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// Mapping of item types to zones
const itemToZoneMap = {
  'Bottle': 'A',
  'Watch': 'B',
  'Phone': 'C'
}

const zoneToItemMap = {
  'A': 'Bottle',
  'B': 'Watch',
  'C': 'Phone'
}

// Colors for different item types (Tailwind classes)
const itemColors = {
  'Bottle': 'bg-blue-200 border-blue-500',
  'Watch': 'bg-green-200 border-green-500',
  'Phone': 'bg-purple-200 border-purple-500'
}

// Zone header colors
const zoneHeaderColors = {
  'A': 'bg-blue-500',
  'B': 'bg-green-500',
  'C': 'bg-purple-500'
}

export default function SimulationPage() {
  // State for the last scanned item
  const [lastScannedItem, setLastScannedItem] = useState(null)
  
  // State for forklift stacks at the station
  const [forkliftStacks, setForkliftStacks] = useState({
    'A': [],
    'B': [],
    'C': []
  })
  
  // State for forklift status
  const [forkliftStatus, setForkliftStatus] = useState({
    'A': 'AT_STATION',
    'B': 'AT_STATION',
    'C': 'AT_STATION'
  })
  
  // State for placement logs (messages about item placement)
  const [placementLogs, setPlacementLogs] = useState({
    'A': [],
    'B': [],
    'C': []
  })
  
  // State for occupied racks
  const [occupiedRacks, setOccupiedRacks] = useState({
    'A': new Set(),
    'B': new Set(),
    'C': new Set()
  })

  // State for forklift positions (for animation)
  const [forkliftPositions, setForkliftPositions] = useState({
    'A': 0, // 0 = at station, 100 = at inventory zone
    'B': 0,
    'C': 0
  })

  // State for forklift direction
  const [forkliftDirections, setForkliftDirections] = useState({
    'A': 'forward', // 'forward' or 'backward'
    'B': 'forward',
    'C': 'forward'
  })

  // Counter for item IDs (increments with each scan)
  const [itemIdCounter, setItemIdCounter] = useState(1)
  
  // State for simulation running status
  const [isSimulationRunning, setIsSimulationRunning] = useState(false)

  // Animation intervals
  const animationIntervals = useRef({
    'A': null,
    'B': null,
    'C': null
  })

  // Store unique identifiers for rendering
  const [itemKeys, setItemKeys] = useState({
    'A': new Map(),
    'B': new Map(),
    'C': new Map()
  })
  
  // Request a scan from the API
  const requestItemScan = useCallback(async () => {
    try {
      const response = await fetch('/api/scan-item', {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        processScannedItem(data)
      } else {
        console.error('Failed to scan item:', await response.text())
      }
    } catch (error) {
      console.error('Error scanning item:', error)
    }
  }, [])
  
  // Process a scanned item from the API
  const processScannedItem = useCallback((item) => {
    // Generate a truly unique ID for this item
    const uniqueId = `${item.id || 'ITEM'}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const uniqueItem = {
      ...item,
      originalId: item.id, // Keep the original ID for reference
      id: uniqueId // Use our guaranteed unique ID
    }
    
    // Update last scanned item
    setLastScannedItem(uniqueItem)
    
    // Add item to stack if forklift is at station
    const zone = uniqueItem.zone
    if (forkliftStatus[zone] === 'AT_STATION') {
      addItemToStack(uniqueItem)
    } else {
      console.log(`Forklift for Zone ${zone} is busy. Item will wait until forklift returns.`)
    }
  }, [forkliftStatus])
  
  // Add item to forklift stack
  const addItemToStack = useCallback((item) => {
    const { zone } = item
    
    // Generate a rendering key for this item
    const renderKey = `item-${zone}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Store the unique rendering key
    setItemKeys(prev => {
      const updatedKeys = { ...prev }
      updatedKeys[zone] = new Map(updatedKeys[zone])
      updatedKeys[zone].set(item.id, renderKey)
      return updatedKeys
    })
    
    // Add the item to the stack
    setForkliftStacks(prev => {
      const updatedStacks = { ...prev }
      updatedStacks[zone] = [...updatedStacks[zone], item]
      
      // If there are 5 items after adding this one, trigger forklift cycle
      if (updatedStacks[zone].length === 5) {
        setTimeout(() => startForkliftCycle(zone), 100)
      }
      
      return updatedStacks
    })
    
    // Mark rack as occupied
    setOccupiedRacks(prev => {
      const updatedRacks = { ...prev }
      updatedRacks[zone] = new Set(updatedRacks[zone])
      updatedRacks[zone].add(item.assignedRackId)
      return updatedRacks
    })
  }, [])
  
  // Start forklift cycle (movement to zone)
  const startForkliftCycle = useCallback((zone) => {
    // Update forklift status to moving
    setForkliftStatus(prev => ({
      ...prev,
      [zone]: 'MOVING_TO_ZONE'
    }))
    
    // Set direction to forward (towards inventory)
    setForkliftDirections(prev => ({
      ...prev,
      [zone]: 'forward'
    }))
    
    // Start forklift animation
    startForkliftAnimation(zone, 'forward')
    
    // Get the items to place (current stack)
    const itemsToPlace = [...forkliftStacks[zone]]
    
    // Clear the visual stack immediately (replacement forklift)
    setForkliftStacks(prev => ({
      ...prev,
      [zone]: []
    }))
    
    // Clear item keys for this zone
    setItemKeys(prev => {
      const updatedKeys = { ...prev }
      updatedKeys[zone] = new Map()
      return updatedKeys
    })
    
    // Simulate travel time to zone (8 seconds)
    setTimeout(() => {
      // Report to API that forklift arrived at zone
      reportForkliftArrival(zone, itemsToPlace)
    }, 8000)
  }, [forkliftStacks])
  
  // Report forklift arrival to API
  const reportForkliftArrival = useCallback(async (zone, itemsToPlace) => {
    try {
      const response = await fetch('/api/forklift-arrival', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          zone,
          items: itemsToPlace
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        // Start placing items (with potential delay from API)
        setTimeout(() => {
          // Update status to placing items
          setForkliftStatus(prev => ({
            ...prev,
            [zone]: 'PLACING_ITEMS'
          }))
          
          placeItems(zone, itemsToPlace)
        }, data.processingDelay || 0)
      } else {
        console.error('Failed to report forklift arrival:', await response.text())
      }
    } catch (error) {
      console.error('Error reporting forklift arrival:', error)
    }
  }, [])
  
  // Start forklift animation
  const startForkliftAnimation = useCallback((zone, direction) => {
    // Clear any existing animation interval
    if (animationIntervals.current[zone]) {
      clearInterval(animationIntervals.current[zone])
    }
    
    // Set initial position if needed
    if (direction === 'forward') {
      setForkliftPositions(prev => ({
        ...prev,
        [zone]: 0 // Starting at station
      }))
    } else {
      setForkliftPositions(prev => ({
        ...prev,
        [zone]: 100 // Starting at inventory zone
      }))
    }
    
    // Animation interval
    animationIntervals.current[zone] = setInterval(() => {
      setForkliftPositions(prev => {
        const currentPos = prev[zone]
        let newPos
        
        if (direction === 'forward') {
          newPos = currentPos + 1
          if (newPos >= 100) {
            // Reached inventory zone
            clearInterval(animationIntervals.current[zone])
            return { ...prev, [zone]: 100 }
          }
        } else {
          newPos = currentPos - 1
          if (newPos <= 0) {
            // Reached station
            clearInterval(animationIntervals.current[zone])
            return { ...prev, [zone]: 0 }
          }
        }
        
        return { ...prev, [zone]: newPos }
      })
    }, 80) // Adjust speed of animation here
  }, [])
  
  // Place items one by one in the zone
  const placeItems = useCallback((zone, itemsToPlace) => {
    if (itemsToPlace.length === 0) {
      // All items placed, forklift returns
      setForkliftStatus(prev => ({
        ...prev,
        [zone]: 'RETURNING'
      }))
      
      // Set direction to backward (towards station)
      setForkliftDirections(prev => ({
        ...prev,
        [zone]: 'backward'
      }))
      
      // Start return animation
      startForkliftAnimation(zone, 'backward')
      
      // Simulate return travel time (8 seconds)
      setTimeout(() => {
        // Report to API that forklift returned to station
        reportForkliftReturn(zone)
      }, 8000)
      
      return
    }
    
    // Take the next item to place
    const item = itemsToPlace.shift()
    
    // Create placement log message with original ID if available
    const displayId = item.originalId || item.id
    const logMessage = `Placed ${item.name} (ID: ${displayId}) in Rack ${item.assignedRackId}`
    
    // Generate a unique log key
    const logKey = `log-${zone}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Update placement logs with unique key
    setPlacementLogs(prev => {
      const updatedLogs = { ...prev }
      updatedLogs[zone] = [...updatedLogs[zone], { message: logMessage, key: logKey }]
      return updatedLogs
    })
    
    // Place next item after 2 seconds
    setTimeout(() => placeItems(zone, itemsToPlace), 2000)
  }, [startForkliftAnimation])
  
  // Report forklift return to API
  const reportForkliftReturn = useCallback(async (zone) => {
    try {
      const response = await fetch('/api/forklift-return', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ zone })
      })
      
      if (response.ok) {
        // Reset status to at station after API confirmation
        setForkliftStatus(prev => ({
          ...prev,
          [zone]: 'AT_STATION'
        }))
        
        // Clear placement logs for this zone
        setPlacementLogs(prev => ({
          ...prev,
          [zone]: []
        }))
      } else {
        console.error('Failed to report forklift return:', await response.text())
      }
    } catch (error) {
      console.error('Error reporting forklift return:', error)
    }
  }, [])
  
  // Toggle simulation
  const toggleSimulation = useCallback(() => {
    if (isSimulationRunning) {
      setIsSimulationRunning(false)
    } else {
      setIsSimulationRunning(true)
    }
  }, [isSimulationRunning])
  
  // Effect to run continuous simulation
  useEffect(() => {
    let scanInterval
    
    if (isSimulationRunning) {
      // Scan a new item every 4-6 seconds (random interval for more realistic feel)
      const getRandomInterval = () => 4000 + Math.floor(Math.random() * 2000)
      
      const scheduleNextScan = () => {
        return setTimeout(() => {
          requestItemScan()
          scanInterval = scheduleNextScan()
        }, getRandomInterval())
      }
      
      scanInterval = scheduleNextScan()
    }
    
    return () => {
      if (scanInterval) clearTimeout(scanInterval)
    }
  }, [isSimulationRunning, requestItemScan])

  // Cleanup animation intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(animationIntervals.current).forEach(interval => {
        if (interval) clearInterval(interval)
      })
    }
  }, [])

  // Render item in stack with guaranteed unique key
  const renderStackItem = (item) => {
    // Get the unique rendering key or generate a new one if not found
    const key = itemKeys[item.zone]?.get(item.id) || `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <div key={key} className={`${itemColors[item.type]} border p-2 m-1 rounded shadow-sm`}>
        <div className="font-medium">{item.name}</div>
        <div className="text-xs">ID: {item.originalId || item.id}</div>
        <div className="text-xs">Rack: {item.assignedRackId}</div>
      </div>
    )
  }
  
  // Render forklift
  const renderForklift = (zone) => {
    const position = forkliftPositions[zone]
    const direction = forkliftDirections[zone]
    const status = forkliftStatus[zone]
    
    // Determine forklift icon/emoji based on direction
    const forkliftIcon = direction === 'forward' ? '🚛➡️' : '🚛⬅️'
    
    // For placing items, use a special icon
    const displayIcon = status === 'PLACING_ITEMS' ? '🏗️' : forkliftIcon
    
    return (
      <div className="relative h-8 my-4">
        <div className="absolute top-0 left-0 w-full h-2 bg-gray-300 rounded">
          <div className="absolute h-4 -top-1" style={{ left: `${position}%` }}>
            <div className="text-2xl transform -translate-y-1">{displayIcon}</div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Warehouse Management System Simulation</h1>
      
      {/* Control Button */}
      <div className="flex justify-center mb-6">
        <button 
          onClick={toggleSimulation}
          className={`px-6 py-2 rounded-md font-medium text-white ${isSimulationRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          {isSimulationRunning ? 'Stop Simulation' : 'Start Simulation'}
        </button>
        
        {/* Manual scan button - useful for testing */}
        <button 
          onClick={requestItemScan}
          className="ml-4 px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-medium"
        >
          Manual Scan
        </button>
      </div>
      
      {/* Last Scanned Item Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-3">Last Scanned Item</h2>
        
        {lastScannedItem ? (
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${itemColors[lastScannedItem.type]}`}>
              {lastScannedItem.type === 'Bottle' && <span className="text-xl">🍾</span>}
              {lastScannedItem.type === 'Watch' && <span className="text-xl">⌚</span>}
              {lastScannedItem.type === 'Phone' && <span className="text-xl">📱</span>}
            </div>
            <div>
              <div className="font-medium">{lastScannedItem.name} (ID: {lastScannedItem.originalId || lastScannedItem.id})</div>
              <div className="text-sm text-gray-600">
                Assigned to Zone {lastScannedItem.zone}, Rack {lastScannedItem.assignedRackId}
              </div>
              <div className="text-xs text-gray-500">
                Timestamp: {new Date(lastScannedItem.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">No items scanned yet</div>
        )}
      </div>
      
      {/* Zone Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Zone A: Bottles */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className={`${zoneHeaderColors.A} text-white font-bold text-lg p-3`}>
            Zone A: Bottles
          </div>
          
          <div className="p-4">
            {/* Forklift Status */}
            <div className="mb-4">
              <div className="font-semibold mb-1">Forklift Status:</div>
              <div className={`inline-block px-3 py-1 rounded-full text-white text-sm
                ${forkliftStatus.A === 'AT_STATION' ? 'bg-green-500' : 
                  forkliftStatus.A === 'MOVING_TO_ZONE' ? 'bg-yellow-500' :
                  forkliftStatus.A === 'PLACING_ITEMS' ? 'bg-blue-500' : 'bg-purple-500'}`
              }>
                {forkliftStatus.A.replace(/_/g, ' ')}
              </div>
            </div>

            {/* Forklift Animation */}
            {renderForklift('A')}
            
            {/* Forklift Stack if AT_STATION */}
            {forkliftStatus.A === 'AT_STATION' && (
              <div>
                <h3 className="font-semibold mb-2">Forklift Stack ({forkliftStacks.A.length}/5):</h3>
                <div className="border border-dashed border-gray-300 rounded-lg p-3 min-h-40">
                  {forkliftStacks.A.length > 0 ? (
                    forkliftStacks.A.map(item => renderStackItem(item))
                  ) : (
                    <div className="text-gray-400 text-center py-6">Empty</div>
                  )}
                </div>
              </div>
            )}
            
            {/* Status/Placement Messages if not AT_STATION */}
            {forkliftStatus.A !== 'AT_STATION' && (
              <div>
                <h3 className="font-semibold mb-2">Status Updates:</h3>
                <div className="border rounded-lg p-3 min-h-40 bg-gray-50">
                  {forkliftStatus.A === 'MOVING_TO_ZONE' && (
                    <div className="text-yellow-600">Forklift is moving to Zone A...</div>
                  )}
                  
                  {forkliftStatus.A === 'RETURNING' && (
                    <div className="text-purple-600">Forklift is returning to station...</div>
                  )}
                  
                  {forkliftStatus.A === 'PLACING_ITEMS' && placementLogs.A.length > 0 && (
                    <div>
                      {placementLogs.A.map((log) => (
                        <div key={log.key} className="text-blue-600 mb-1">{log.message}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Zone B: Watches */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className={`${zoneHeaderColors.B} text-white font-bold text-lg p-3`}>
            Zone B: Watches
          </div>
          
          <div className="p-4">
            {/* Forklift Status */}
            <div className="mb-4">
              <div className="font-semibold mb-1">Forklift Status:</div>
              <div className={`inline-block px-3 py-1 rounded-full text-white text-sm
                ${forkliftStatus.B === 'AT_STATION' ? 'bg-green-500' : 
                  forkliftStatus.B === 'MOVING_TO_ZONE' ? 'bg-yellow-500' :
                  forkliftStatus.B === 'PLACING_ITEMS' ? 'bg-blue-500' : 'bg-purple-500'}`
              }>
                {forkliftStatus.B.replace(/_/g, ' ')}
              </div>
            </div>

            {/* Forklift Animation */}
            {renderForklift('B')}
            
            {/* Forklift Stack if AT_STATION */}
            {forkliftStatus.B === 'AT_STATION' && (
              <div>
                <h3 className="font-semibold mb-2">Forklift Stack ({forkliftStacks.B.length}/5):</h3>
                <div className="border border-dashed border-gray-300 rounded-lg p-3 min-h-40">
                  {forkliftStacks.B.length > 0 ? (
                    forkliftStacks.B.map(item => renderStackItem(item))
                  ) : (
                    <div className="text-gray-400 text-center py-6">Empty</div>
                  )}
                </div>
              </div>
            )}
            
            {/* Status/Placement Messages if not AT_STATION */}
            {forkliftStatus.B !== 'AT_STATION' && (
              <div>
                <h3 className="font-semibold mb-2">Status Updates:</h3>
                <div className="border rounded-lg p-3 min-h-40 bg-gray-50">
                  {forkliftStatus.B === 'MOVING_TO_ZONE' && (
                    <div className="text-yellow-600">Forklift is moving to Zone B...</div>
                  )}
                  
                  {forkliftStatus.B === 'RETURNING' && (
                    <div className="text-purple-600">Forklift is returning to station...</div>
                  )}
                  
                  {forkliftStatus.B === 'PLACING_ITEMS' && placementLogs.B.length > 0 && (
                    <div>
                      {placementLogs.B.map((log) => (
                        <div key={log.key} className="text-blue-600 mb-1">{log.message}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Zone C: Phones */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className={`${zoneHeaderColors.C} text-white font-bold text-lg p-3`}>
            Zone C: Phones
          </div>
          
          <div className="p-4">
            {/* Forklift Status */}
            <div className="mb-4">
              <div className="font-semibold mb-1">Forklift Status:</div>
              <div className={`inline-block px-3 py-1 rounded-full text-white text-sm
                ${forkliftStatus.C === 'AT_STATION' ? 'bg-green-500' : 
                  forkliftStatus.C === 'MOVING_TO_ZONE' ? 'bg-yellow-500' :
                  forkliftStatus.C === 'PLACING_ITEMS' ? 'bg-blue-500' : 'bg-purple-500'}`
              }>
                {forkliftStatus.C.replace(/_/g, ' ')}
              </div>
            </div>

            {/* Forklift Animation */}
            {renderForklift('C')}
            
            {/* Forklift Stack if AT_STATION */}
            {forkliftStatus.C === 'AT_STATION' && (
              <div>
                <h3 className="font-semibold mb-2">Forklift Stack ({forkliftStacks.C.length}/5):</h3>
                <div className="border border-dashed border-gray-300 rounded-lg p-3 min-h-40">
                  {forkliftStacks.C.length > 0 ? (
                    forkliftStacks.C.map(item => renderStackItem(item))
                  ) : (
                    <div className="text-gray-400 text-center py-6">Empty</div>
                  )}
                </div>
              </div>
            )}
            
            {/* Status/Placement Messages if not AT_STATION */}
            {forkliftStatus.C !== 'AT_STATION' && (
              <div>
                <h3 className="font-semibold mb-2">Status Updates:</h3>
                <div className="border rounded-lg p-3 min-h-40 bg-gray-50">
                  {forkliftStatus.C === 'MOVING_TO_ZONE' && (
                    <div className="text-yellow-600">Forklift is moving to Zone C...</div>
                  )}
                  
                  {forkliftStatus.C === 'RETURNING' && (
                    <div className="text-purple-600">Forklift is returning to station...</div>
                  )}
                  
                  {forkliftStatus.C === 'PLACING_ITEMS' && placementLogs.C.length > 0 && (
                    <div>
                      {placementLogs.C.map((log) => (
                        <div key={log.key} className="text-blue-600 mb-1">{log.message}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Connection Status */}
      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-green-700 font-medium">Connected to WMS API</span>
        </div>
      </div>
    </div>
  )
}