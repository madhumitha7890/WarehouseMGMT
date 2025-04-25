'use client';

import { useState, useEffect } from 'react';

export default function InventoryManagementPage() {
  // Mock inventory data - would be fetched from API in a real application
  const [inventoryItems, setInventoryItems] = useState([
    {
      id: 'ITM-1001',
      name: 'Wireless Keyboard',
      category: 'Electronics',
      checkinTimestamp: '2025-04-20T08:15:22',
      checkoutTimestamp: null
    },
    {
      id: 'ITM-1002',
      name: 'Office Chair',
      category: 'Furniture',
      checkinTimestamp: '2025-04-19T14:30:45',
      checkoutTimestamp: '2025-04-23T11:20:18'
    },
    {
      id: 'ITM-1003',
      name: 'LED Monitor 27"',
      category: 'Electronics',
      checkinTimestamp: '2025-04-22T09:45:12',
      checkoutTimestamp: null
    },
    {
      id: 'ITM-1004',
      name: 'Desk Lamp',
      category: 'Accessories',
      checkinTimestamp: '2025-04-15T16:22:37',
      checkoutTimestamp: null
    },
    {
      id: 'ITM-1005',
      name: 'Laptop Stand',
      category: 'Accessories',
      checkinTimestamp: '2025-04-10T11:05:49',
      checkoutTimestamp: '2025-04-24T15:30:22'
    },
    {
      id: 'ITM-1006',
      name: 'Wireless Mouse',
      category: 'Electronics',
      checkinTimestamp: '2025-04-18T13:40:15',
      checkoutTimestamp: null
    },
    {
      id: 'ITM-1007',
      name: 'Filing Cabinet',
      category: 'Furniture',
      checkinTimestamp: '2025-04-12T10:25:33',
      checkoutTimestamp: null
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });

  // Get unique categories for filter dropdown
  const categories = ['All', ...new Set(inventoryItems.map(item => item.category))];

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '—';
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Get sorted and filtered data
  const getSortedItems = () => {
    let filteredItems = [...inventoryItems];
    
    // Apply search filter
    if (searchTerm) {
      filteredItems = filteredItems.filter(item => 
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (selectedCategory !== 'All') {
      filteredItems = filteredItems.filter(item => item.category === selectedCategory);
    }
    
    // Apply sorting
    if (sortConfig.key) {
      filteredItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filteredItems;
  };

  // Simulate fetching inventory data
  useEffect(() => {
    // In a real application, this would be an API call
    console.log('Fetching inventory data...');
    // API call would go here
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
      
      {/* Filters and Search */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search by ID or name..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 text-gray-400 absolute right-3 top-3" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <div className="flex-shrink-0">
          <select
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex-shrink-0">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            Add New Item
          </button>
        </div>
      </div>
      
      {/* Inventory Table */}
      <div className="overflow-x-auto shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('id')}
              >
                <div className="flex items-center">
                  Item ID
                  {sortConfig.key === 'id' && (
                    <span className="ml-2">
                      {sortConfig.direction === 'ascending' ? '▲' : '▼'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('name')}
              >
                <div className="flex items-center">
                  Name
                  {sortConfig.key === 'name' && (
                    <span className="ml-2">
                      {sortConfig.direction === 'ascending' ? '▲' : '▼'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('category')}
              >
                <div className="flex items-center">
                  Category
                  {sortConfig.key === 'category' && (
                    <span className="ml-2">
                      {sortConfig.direction === 'ascending' ? '▲' : '▼'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('checkinTimestamp')}
              >
                <div className="flex items-center">
                  Check-in Time
                  {sortConfig.key === 'checkinTimestamp' && (
                    <span className="ml-2">
                      {sortConfig.direction === 'ascending' ? '▲' : '▼'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('checkoutTimestamp')}
              >
                <div className="flex items-center">
                  Check-out Time
                  {sortConfig.key === 'checkoutTimestamp' && (
                    <span className="ml-2">
                      {sortConfig.direction === 'ascending' ? '▲' : '▼'}
                    </span>
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {getSortedItems().map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    item.category === 'Electronics' ? 'bg-blue-100 text-blue-800' :
                    item.category === 'Furniture' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {item.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatTimestamp(item.checkinTimestamp)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatTimestamp(item.checkoutTimestamp)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                  {!item.checkoutTimestamp ? (
                    <button className="text-green-600 hover:text-green-900">Check-out</button>
                  ) : (
                    <button className="text-gray-400 cursor-not-allowed" disabled>Checked-out</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Previous</button>
          <button className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Next</button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{getSortedItems().length}</span> of{' '}
              <span className="font-medium">{getSortedItems().length}</span> results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="relative inline-flex items-center bg-blue-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">1</button>
              <button className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}