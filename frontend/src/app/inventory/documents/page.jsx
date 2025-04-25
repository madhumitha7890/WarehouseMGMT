// app/inventory/documents/page.jsx
"use client";

import { useState, useEffect } from 'react';
import DataTable from '@/app/components/DataTable';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/documents'); // ✅ Correct path
        if (!response.ok) throw new Error('Failed to fetch data');
        const result = await response.json();
        setDocuments(result.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-xl text-gray-600">Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 bg-red-50 border-l-4 border-red-500 text-red-700 my-5 mx-auto max-w-4xl">
        <h3 className="text-lg font-semibold">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Database Documents</h1>
      <DataTable documents={documents} />
    </div>
  );
}
