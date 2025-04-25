
'use client';

import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function HomePage() {
  // Mock data - would be fetched from API in real application
  const [kpiData, setKpiData] = useState({
    ordersProcessed: { value: 1248, change: 12 },
    pickingAccuracy: { value: 99.8, change: 2.3 },
    storageEfficiency: { value: 87.2, change: 5.6 },
    processingTime: { value: 1.2, change: -30 }
  });
  
  const [inventoryData, setInventoryData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Inventory Levels',
        data: [65, 72, 68, 75, 82, 75, 78],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      }
    ]
  });
  
  const [forecastData, setForecastData] = useState({
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
    datasets: [
      {
        label: 'Predicted Demand',
        data: [120, 110, 125, 115, 130, 105, 120, 110],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      }
    ]
  });
  
  const [alerts, setAlerts] = useState([
    { id: 1, level: 'error', message: 'Low stock alert: SKU-12845' },
    { id: 2, level: 'warning', message: 'Picking arm #3 needs maintenance' },
    { id: 3, level: 'info', message: 'New inventory arrived: 45 items' }
  ]);
  
  // Simulating data fetching
  useEffect(() => {
    // In a real application, this would be API calls
    const fetchData = () => {
      console.log('Fetching dashboard data...');
      // API calls would go here
    };
    
    fetchData();
    // Set up a refresh interval
    const intervalId = setInterval(fetchData, 60000); // refresh every minute
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard 
          title="Orders Processed" 
          value={kpiData.ordersProcessed.value} 
          change={kpiData.ordersProcessed.change} 
        />
        <KpiCard 
          title="Picking Accuracy" 
          value={`${kpiData.pickingAccuracy.value}%`} 
          change={kpiData.pickingAccuracy.change} 
        />
        <KpiCard 
          title="Storage Efficiency" 
          value={`${kpiData.storageEfficiency.value}%`} 
          change={kpiData.storageEfficiency.change} 
        />
        <KpiCard 
          title="Processing Time" 
          value={`${kpiData.processingTime.value} min`} 
          change={kpiData.processingTime.change} 
          inverseChange={true}
        />
      </div>
    
      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Inventory Levels</h2>
          <div className="h-64">
            <Line 
              data={inventoryData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Warehouse Layout</h2>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <WarehouseMap />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-1">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Alert Center</h2>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Predictive Demand Forecast</h2>
          <div className="h-64">
            <Bar 
              data={forecastData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, change, inverseChange = false }) {
  const isPositive = inverseChange ? change < 0 : change > 0;
  
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="text-sm font-medium text-gray-500 truncate">{title}</div>
            <div className="mt-1 text-3xl font-semibold text-gray-900">{value}</div>
          </div>
          <div className="ml-auto">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isPositive ? '↑' : '↓'} {Math.abs(change)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertItem({ alert }) {
  const levelStyles = {
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };
  
  return (
    <div className="flex items-center p-3 bg-gray-50 rounded-md">
      <div className={`w-3 h-3 rounded-full ${levelStyles[alert.level]}`}></div>
      <div className="ml-3 text-sm text-gray-600">{alert.message}</div>
    </div>
  );
}

function WarehouseMap() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
      {/* Outer warehouse border */}
      <rect x="10" y="10" width="380" height="180" fill="#f5f5f5" stroke="#d1d5db" strokeWidth="2" />
      
      {/* Shelving units */}
      <g>
        <rect x="50" y="30" width="20" height="60" fill="#3b82f6" />
        <rect x="80" y="30" width="20" height="60" fill="#3b82f6" />
        <rect x="110" y="30" width="20" height="60" fill="#10b981" />
        <rect x="140" y="30" width="20" height="60" fill="#3b82f6" />
        <rect x="170" y="30" width="20" height="60" fill="#ef4444" />
        <rect x="200" y="30" width="20" height="60" fill="#3b82f6" />
      </g>

      <g>
        <rect x="50" y="110" width="20" height="60" fill="#3b82f6" />
        <rect x="80" y="110" width="20" height="60" fill="#ef4444" />
        <rect x="110" y="110" width="20" height="60" fill="#3b82f6" />
        <rect x="140" y="110" width="20" height="60" fill="#10b981" />
        <rect x="170" y="110" width="20" height="60" fill="#3b82f6" />
        <rect x="200" y="110" width="20" height="60" fill="#3b82f6" />
      </g>
      
      {/* Robots */}
      <circle cx="250" cy="50" r="8" fill="#8b5cf6" />
      <circle cx="280" cy="140" r="8" fill="#8b5cf6" />
      <circle cx="320" cy="90" r="8" fill="#8b5cf6" />
      
      {/* Legend */}
      <g transform="translate(260, 30)">
        <rect x="0" y="0" width="10" height="10" fill="#3b82f6" />
        <text x="15" y="10" fontSize="10" fill="#4b5563">Normal</text>
        
        <rect x="0" y="15" width="10" height="10" fill="#10b981" />
        <text x="15" y="25" fontSize="10" fill="#4b5563">High Stock</text>
        
        <rect x="0" y="30" width="10" height="10" fill="#ef4444" />
        <text x="15" y="40" fontSize="10" fill="#4b5563">Low Stock</text>
        
        <circle cx="5" cy="50" r="5" fill="#8b5cf6" />
        <text x="15" y="55" fontSize="10" fill="#4b5563">Robot</text>
      </g>
    </svg>
  );
}