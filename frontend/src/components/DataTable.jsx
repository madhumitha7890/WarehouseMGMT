// app/components/DataTable.jsx
"use client";

import React, { useState } from 'react';

const DataTable = ({ documents, onCheckout }) => {
  const [data, setData] = useState(documents || []);

  // If there are no documents
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-5 px-4 italic text-gray-500 bg-gray-50 rounded-lg">
        No documents found in the database.
      </div>
    );
  }

  // Extract column headers from the first document
  const columns = Object.keys(data[0]).slice(1, -1);

  // Handle check_out action
  const handlecheck_out = async (doc, index) => {
    // Create a timestamp for the check_out
    const timestamp = new Date().toISOString();
    
    // Get the document's id (not _id)
    const docId = doc.id;
    
    if (!docId) {
      console.error("Document has no id field, cannot update");
      return;
    }
    
    // Create a copy of the current data and update locally for immediate UI feedback
    const updatedData = [...data];
    updatedData[index] = {
      ...updatedData[index],
      check_out: timestamp
    };

    // Update the local state for immediate feedback
    setData(updatedData);
    
    // Call the parent callback if provided
    if (onCheckout) {
      await onCheckout(docId, doc.class, timestamp);
    }
  };

  return (
    <div className="w-full overflow-x-auto shadow-lg rounded-lg">
      <table className="w-full table-auto bg-white">
        <thead>
          <tr className="bg-gray-100">
            {columns.map((column) => (
              <th
                key={column}
                className="px-4 py-3 text-left font-semibold text-gray-700 border-b-2 border-gray-200"
              >
                {formatColumnName(column)}
              </th>
            ))}
            <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b-2 border-gray-200">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((doc, index) => (
            <tr
              key={doc.id || index}
              className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}
            >
              {columns.map((column) => (
                <td
                  key={`${doc.id || index}-${column}`}
                  className="px-4 py-3 border-b border-gray-200"
                >
                  {formatCellValue(doc[column])}
                </td>
              ))}
              <td className="px-4 py-3 border-b border-gray-200">
                <button
                  onClick={() => handlecheck_out(doc, index)}
                  disabled={!!doc.check_out}
                  className={`font-medium py-1 px-3 rounded ${
                    doc.check_out 
                      ? 'bg-gray-300 text-gray-700 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {doc.check_out ? 'Checked Out' : 'check_out'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Helper function to format column names
const formatColumnName = (column) => {
  // Convert _id to ID, or convert camelCase/snake_case to Title Case
  if (column === '_id') return 'ID';
  if (column === 'id') return 'ID';
  
  return column
    // Insert space before capital letters and uppercase the first character
    .replace(/([A-Z])/g, ' $1')
    // Replace underscores with spaces
    .replace(/_/g, ' ')
    // Uppercase first character of each word
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
};

// Helper function to format cell values based on their type
const formatCellValue = (value) => {
  if (value === null || value === undefined) {
    return '-';
  }
  
  if (typeof value === 'object') {
    // Handle MongoDB ObjectId
    if (value.toString && typeof value.toString === 'function') {
      return value.toString();
    }
    
    // For Date objects
    if (value instanceof Date) {
      return value.toLocaleString();
    }
    
    // For nested objects or arrays, stringify them
    return JSON.stringify(value);
  }
  
  // Handle boolean values
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  return String(value);
};

export default DataTable;