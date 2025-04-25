"use client";

import React from 'react';

const DataTable = ({ documents }) => {
  // If there are no documents
  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-5 px-4 italic text-gray-500 bg-gray-50 rounded-lg">
        No documents found in the database.
      </div>
    );
  }

  // Extract column headers from the first document
  const columns = Object.keys(documents[0]);

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
          </tr>
        </thead>
        <tbody>
          {documents.map((doc, index) => (
            <tr 
              key={doc._id || index} 
              className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}
            >
              {columns.map((column) => (
                <td 
                  key={`${doc._id || index}-${column}`} 
                  className="px-4 py-3 border-b border-gray-200"
                >
                  {formatCellValue(doc[column])}
                </td>
              ))}
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
    // Handle ObjectId
    if (value.toString && value.toString().includes('ObjectId')) {
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
