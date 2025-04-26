// app/inventory/documents/page.jsx
"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/DataTable";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateStatus, setUpdateStatus] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/documents");
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      setDocuments(result.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (id, label, timestamp) => {
    setUpdateStatus({ type: "loading", message: "Processing checkout..." });

    const response = await fetch(`/api/documents/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ check_out: timestamp, id, label }),
    });

    try {
      const result = await response.json();
      console.log(result);

      if (!response.ok) {
        throw new Error(result.message || "Failed to update document");
      }

      setUpdateStatus({
        type: "success",
        message: "Item checked out successfully!",
      });

      // Refresh data after successful update
      fetchData();

      // Clear status message after 3 seconds
      setTimeout(() => {
        setUpdateStatus(null);
      }, 3000);
    } catch (err) {
      console.error("Checkout error:", err);
      setUpdateStatus({
        type: "error",
        message: `Checkout failed: ${err.message}`,
      });

      // Clear error message after 5 seconds
      setTimeout(() => {
        setUpdateStatus(null);
      }, 5000);
    }
  };

  if (loading && documents.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-xl text-gray-600">Loading data...</div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Database Documents
      </h1>

      {/* Status messages */}
      {updateStatus && (
        <div
          className={`mb-4 p-3 rounded-md ${
            updateStatus.type === "success"
              ? "bg-green-100 text-green-700 border-l-4 border-green-500"
              : updateStatus.type === "error"
              ? "bg-red-100 text-red-700 border-l-4 border-red-500"
              : "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
          }`}
        >
          {updateStatus.message}
        </div>
      )}

      {error ? (
        <div className="p-5 bg-red-50 border-l-4 border-red-500 text-red-700 my-5">
          <h3 className="text-lg font-semibold">Error</h3>
          <p>{error}</p>
          <button
            onClick={fetchData}
            className="mt-3 bg-red-600 hover:bg-red-700 text-white font-medium py-1 px-3 rounded"
          >
            Retry
          </button>
        </div>
      ) : (
        <DataTable documents={documents} onCheckout={handleCheckout} />
      )}
    </div>
  );
}
