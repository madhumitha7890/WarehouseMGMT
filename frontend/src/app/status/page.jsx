'use client';

import { useState, useEffect } from 'react';

// Status types and their corresponding colors
const STATUS_TYPES = {
  IDLE: { label: 'Idle', color: 'bg-gray-200', textColor: 'text-gray-700' },
  ACTIVE: { label: 'Active', color: 'bg-green-500', textColor: 'text-white' },
  BUSY: { label: 'Busy', color: 'bg-yellow-500', textColor: 'text-white' },
  CRITICAL: { label: 'Critical', color: 'bg-red-500', textColor: 'text-white' },
  MAINTENANCE: { label: 'Maintenance', color: 'bg-blue-500', textColor: 'text-white' },
  COMPLETED: { label: 'Completed', color: 'bg-purple-500', textColor: 'text-white' }
};

// Process definitions with descriptions
const PROCESSES = [
  {
    id: 'goods-receiving',
    name: 'Goods Receiving',
    description: 'Receiving and logging incoming inventory shipments',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
  {
    id: 'item-identification',
    name: 'Item Identification',
    description: 'Scanning and categorizing items with unique identifiers',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    id: 'storage-allocation',
    name: 'Storage Allocation',
    description: 'Assigning optimal warehouse locations for items',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    id: 'inventory-management',
    name: 'Inventory Management',
    description: 'Tracking and maintaining accurate stock levels',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    id: 'order-processing',
    name: 'Order Processing',
    description: 'Managing customer orders and picking lists',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'sorting-packaging',
    name: 'Sorting & Packaging',
    description: 'Preparing items for shipment with proper packaging',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'dispatch',
    name: 'Dispatch',
    description: 'Loading and shipping orders to customers',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
  },
  {
    id: 'analytics-reporting',
    name: 'Analytics & Reporting',
    description: 'Generating insights and performance metrics',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  }
];

export default function WarehouseStatusPage() {
  const [processStatuses, setProcessStatuses] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activityLog, setActivityLog] = useState([]);
  const [showDetails, setShowDetails] = useState(null);

  // Initialize process statuses randomly
  useEffect(() => {
    const statusOptions = Object.keys(STATUS_TYPES);
    const initialStatuses = {};
    
    PROCESSES.forEach(process => {
      // Choose a random status for initial state
      const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
      initialStatuses[process.id] = {
        status: randomStatus,
        lastUpdated: new Date(),
        details: {
          itemsProcessed: Math.floor(Math.random() * 100),
          performanceScore: Math.floor(Math.random() * 100),
          estimatedCompletion: new Date(Date.now() + Math.random() * 3600000).toLocaleTimeString()
        }
      };
    });
    
    setProcessStatuses(initialStatuses);
    
    // Add initial statuses to activity log
    const initialLogs = PROCESSES.map(process => ({
      timestamp: new Date(),
      processId: process.id,
      message: `${process.name} initialized with status: ${STATUS_TYPES[initialStatuses[process.id].status].label}`,
      type: 'info'
    }));
    
    setActivityLog(initialLogs);
  }, []);

  // Update statuses periodically
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
      
      // Randomly update statuses
      setProcessStatuses(prevStatuses => {
        const newStatuses = { ...prevStatuses };
        const statusOptions = Object.keys(STATUS_TYPES);
        
        // Randomly select 1-3 processes to update
        const numberOfUpdates = Math.floor(Math.random() * 3) + 1;
        const processesToUpdate = PROCESSES
          .map(p => p.id)
          .sort(() => 0.5 - Math.random())
          .slice(0, numberOfUpdates);
        
        // Update selected processes
        processesToUpdate.forEach(processId => {
          const currentStatus = prevStatuses[processId]?.status || 'IDLE';
          let newStatus;
          
          // Generate a status different from the current one
          do {
            newStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
          } while (newStatus === currentStatus);
          
          newStatuses[processId] = {
            status: newStatus,
            lastUpdated: new Date(),
            details: {
              ...prevStatuses[processId]?.details,
              itemsProcessed: Math.floor(Math.random() * 100),
              performanceScore: Math.floor(Math.random() * 100),
              estimatedCompletion: new Date(Date.now() + Math.random() * 3600000).toLocaleTimeString()
            }
          };
          
          // Add to activity log
          const process = PROCESSES.find(p => p.id === processId);
          setActivityLog(prevLog => [
            {
              timestamp: new Date(),
              processId: processId,
              message: `${process.name} changed from ${STATUS_TYPES[currentStatus].label} to ${STATUS_TYPES[newStatus].label}`,
              type: 'status-change'
            },
            ...prevLog.slice(0, 19) // Keep only the 20 most recent logs
          ]);
        });
        
        return newStatuses;
      });
    }, 5000); // Update every 5 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  // Function to format relative time
  const formatRelativeTime = (timestamp) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    
    if (seconds < 60) return `${seconds} sec ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Warehouse Operations Status</h1>
        <div className="text-sm text-gray-500">
          Last updated: {currentTime.toLocaleTimeString()}
        </div>
      </div>
      
      {/* Status Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PROCESSES.map((process) => {
          const processStatus = processStatuses[process.id] || { status: 'IDLE', lastUpdated: new Date() };
          const status = STATUS_TYPES[processStatus.status];
          
          return (
            <div 
              key={process.id}
              className="bg-white overflow-hidden shadow rounded-lg cursor-pointer transition-transform hover:scale-105"
              onClick={() => setShowDetails(showDetails === process.id ? null : process.id)}
            >
              <div className={`h-2 ${status.color}`}></div>
              <div className="p-5">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <span className={`inline-flex p-2 rounded-lg ${status.color} ${status.textColor}`}>
                      {process.icon}
                    </span>
                    <h3 className="ml-3 text-lg font-medium text-gray-900">{process.name}</h3>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color} ${status.textColor}`}>
                    {status.label}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-500">{process.description}</p>
                <div className="mt-3 text-xs text-gray-500">
                  Updated {formatRelativeTime(processStatus.lastUpdated)}
                </div>
                
                {/* Expandable Details */}
                {showDetails === process.id && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Items Processed</div>
                        <div className="text-gray-900 font-medium">{processStatus.details?.itemsProcessed || 0}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Performance</div>
                        <div className="text-gray-900 font-medium">{processStatus.details?.performanceScore || 0}%</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Est. Completion</div>
                        <div className="text-gray-900 font-medium">{processStatus.details?.estimatedCompletion || 'N/A'}</div>
                      </div>
                    </div>
                    <button 
                      className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDetails(null);
                      }}
                    >
                      Close Details
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Status Legend */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Status Legend</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(STATUS_TYPES).map(([key, status]) => (
              <div key={key} className="flex items-center">
                <span className={`inline-block w-3 h-3 rounded-full ${status.color} mr-2`}></span>
                <span className="text-sm text-gray-700">{status.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Activity Log */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Activity Log</h3>
        </div>
        <div className="px-5 py-3 max-h-60 overflow-y-auto">
          {activityLog.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent activity</p>
          ) : (
            <ul className="space-y-3">
              {activityLog.map((log, index) => {
                const process = PROCESSES.find(p => p.id === log.processId);
                return (
                  <li key={index} className="text-sm">
                    <div className="flex items-start">
                      <span className="text-gray-400 mr-2">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className="text-gray-900">{log.message}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
      
      {/* Real-time Process Flow Visualization */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Process Flow</h3>
        </div>
        <div className="p-5">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {PROCESSES.map((process, index) => {
              const processStatus = processStatuses[process.id] || { status: 'IDLE' };
              const status = STATUS_TYPES[processStatus.status];
              
              return (
                <div key={process.id} className="flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${status.color} ${status.textColor}`}>
                    <div className="text-2xl font-bold">{index + 1}</div>
                  </div>
                  <div className="mt-2 text-xs text-center font-medium">{process.name}</div>
                  
                  {/* Arrow connecting to next step - not shown after the last item */}
                  {index < PROCESSES.length - 1 && (
                    <div className="hidden md:block mx-2">
                      <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}