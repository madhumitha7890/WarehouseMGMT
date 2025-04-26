// pages/stock-dashboard.js
"use client";

import { useEffect, useState } from "react";
import Head from "next/head";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { AlertCircle, ShoppingCart, TrendingUp, Package } from "lucide-react";

// Mock forecast trend data
const mockForecastTrend = [
  { name: "Jan", actual: 30, predicted: 28 },
  { name: "Feb", actual: 35, predicted: 34 },
  { name: "Mar", actual: 40, predicted: 42 },
  { name: "Apr", actual: 45, predicted: 45 },
  { name: "May", actual: 50, predicted: 48 },
  { name: "Jun", actual: null, predicted: 55 },
  { name: "Jul", actual: null, predicted: 60 },
];

export default function AnalyticsPage() {
  // State for all data
  const [stockData, setStockData] = useState([]);
  const [orderQuantities, setOrderQuantities] = useState({});
  const [filterCategory, setFilterCategory] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [counts, setCounts] = useState({});
  const [orders, setOrders] = useState({});
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stock forecasting predictions (could be fetched from API)
  const [forecasts, setForecasts] = useState({
    phone: 0,
    watch: 0,
    bottle: 0,
  });

  // Calculate current available stock
  const calculateAvailableStock = (item) => {
    return (counts[item] || 0) - (orders[item] || 0);
  };

  // Calculate suggested order amount
  const calculateSuggestedOrder = (item) => {
    const currentStock = calculateAvailableStock(item);
    const forecastNeed = (counts[item] || 0) * (counts[item] / currentStock);
    return Math.max(0, forecastNeed - currentStock);
  };

  // Handle order quantity change
  const handleOrderQuantityChange = (item, value) => {
    setOrderQuantities({
      ...orderQuantities,
      [item]: parseInt(value) || 0,
    });
  };

  // Handle order submission
  const handleOrder = (item) => {
    const quantity = orderQuantities[item] || 0;
    if (quantity <= 0) return;

    alert(`Ordering ${quantity} units of ${item}`);
    // Here you would make an API call to your backend
    // Example: await axios.post('/api/order', { item, quantity });

    // Reset order quantity
    const newOrderQuantities = { ...orderQuantities };
    delete newOrderQuantities[item];
    setOrderQuantities(newOrderQuantities);
  };

  // Handle order max needed amount
  const handleOrderMax = (item) => {
    const suggested = calculateSuggestedOrder(item);
    setOrderQuantities({
      ...orderQuantities,
      [item]: Math.round(suggested),
    });
  };

  // Calculate low stock items
  const getLowStockItemsCount = () => {
    return items.filter((item) => {
      const currentStock = calculateAvailableStock(item);
      // Assuming items below 20% of forecast need are "low stock"
      return currentStock < forecasts[item] * 0.2;
    }).length;
  };

  // Fetch data only once when component mounts
  useEffect(() => {
    // Combine all data fetching into a single function
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Use Promise.all to fetch both endpoints simultaneously
        const [documentsResponse, countsResponse] = await Promise.all([
          axios.get("/api/documents"),
          axios.get("/api/counts"),
        ]);

        if (documentsResponse.data.success) {
          setStockData(documentsResponse.data.data);
        }

        if (countsResponse.data.success) {
          setCounts(countsResponse.data.counts);
          setOrders(countsResponse.data.orders);

          // Extract items from counts for the table display
          delete countsResponse.data.counts._id; // Remove _id if present
          delete countsResponse.data.counts.type; // Remove __v if present
          delete countsResponse.data.orders._id; // Remove _id if present
          delete countsResponse.data.orders.type; // Remove __v if present
          setItems(Object.keys(countsResponse.data.counts));
          console.log("Items:", countsResponse.data.orders);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();

    // Empty dependency array means this effect runs once on mount
  }, []);

  // Prepare data for stock chart
  const prepareChartData = () => {
    return items.slice(0, 5).map((item) => ({
      name: item,
      currentStock: calculateAvailableStock(item),
      forecasted: forecasts[item] || 0,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Stock Forecasting Dashboard</title>
        <meta
          name="description"
          content="Admin dashboard for stock forecasting"
        />
      </Head>

      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Stock Forecasting Dashboard
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg font-medium text-gray-600">
              Loading data...
            </div>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Products
                        </dt>
                        <dd className="text-3xl font-semibold text-gray-900">
                          {items.length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                      <AlertCircle className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Low Stock Items
                        </dt>
                        <dd className="text-3xl font-semibold text-gray-900">
                          {getLowStockItemsCount()}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Forecast Accuracy
                        </dt>
                        <dd className="text-3xl font-semibold text-gray-900">
                          94%
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                      <ShoppingCart className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Pending Orders
                        </dt>
                        <dd className="text-3xl font-semibold text-gray-900">
                          {Object.keys(orders).length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Stock Levels Chart */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Current Stock vs. Forecasted Need
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={prepareChartData()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="currentStock"
                        fill="#3B82F6"
                        name="Current Stock"
                      />
                      <Bar
                        dataKey="forecasted"
                        fill="#10B981"
                        name="Forecasted Need"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Forecast Trend Chart */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Forecast Trend Analysis
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={mockForecastTrend}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#3B82F6"
                        name="Actual Demand"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke="#10B981"
                        name="Predicted Demand"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="relative mb-4 md:mb-0">
                  <input
                    type="text"
                    className="w-full sm:w-64 rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search by item name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Stock Table - Simplified */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Forecasted Need
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items
                      .filter((item) =>
                        item.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((item) => {
                        const currentStock = calculateAvailableStock(item);
                        const forecastNeed = Math.round(
                          (counts[item] || 0) * (counts[item] / currentStock)
                        );
                        const isLowStock = currentStock < forecastNeed * 0.2;

                        return (
                          <tr
                            key={item}
                            className={isLowStock ? "bg-red-50" : ""}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {item}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div
                                className={`text-sm font-medium ${
                                  isLowStock ? "text-red-600" : "text-gray-900"
                                }`}
                              >
                                {currentStock}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {forecastNeed}
                              </div>
                              <div className="text-xs text-gray-500">
                                {currentStock < forecastNeed
                                  ? `Need ${forecastNeed - currentStock} more`
                                  : "Sufficient"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  min="1"
                                  className="w-16 text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                  value={orderQuantities[item] || ""}
                                  onChange={(e) =>
                                    handleOrderQuantityChange(
                                      item,
                                      e.target.value
                                    )
                                  }
                                />
                                <button
                                  className="px-2 py-1 text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                  onClick={() => handleOrder(item)}
                                >
                                  Order
                                </button>
                                <button
                                  className="px-2 py-1 text-xs font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                  onClick={() => handleOrderMax(item)}
                                  title="Fill to forecasted level"
                                >
                                  Suggest
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
