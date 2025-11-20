import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';

// Mock WebSocket hook for demo
const useWebSocket = (url) => {
  const [lastMessage, setLastMessage] = useState(null);
  const [connectionStatus] = useState('connected');

  useEffect(() => {
    const interval = setInterval(() => {
      const colors = ['red apple', 'green apple'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      setLastMessage({
        type: 'new_classification',
        data: {
          color: randomColor,
          timestamp: new Date().toISOString()
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return { lastMessage, connectionStatus };
};

const Dashboard = () => {
  const { lastMessage, connectionStatus } = useWebSocket('ws://localhost:5000');
  const [classifications, setClassifications] = useState([]);
  const [statistics, setStatistics] = useState([]);
  const [realtimeData, setRealtimeData] = useState([]);

  useEffect(() => {
    // Simulate fetching initial data
    const mockStats = [
      { color: 'red apple', count: 45 },
      { color: 'green apple', count: 38 }
    ];
    setStatistics(mockStats);

    const mockClassifications = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      color: i % 2 === 0 ? 'red apple' : 'green apple',
      timestamp: new Date(Date.now() - i * 60000).toISOString()
    }));
    setClassifications(mockClassifications);
  }, []);

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'new_classification') {
      const newClassification = {
        id: Date.now(),
        ...lastMessage.data
      };

      setClassifications(prev => [newClassification, ...prev.slice(0, 19)]);

      setStatistics(prev => {
        const updated = [...prev];
        const index = updated.findIndex(s => s.color === newClassification.color);
        if (index !== -1) {
          updated[index] = { ...updated[index], count: updated[index].count + 1 };
        } else {
          updated.push({ color: newClassification.color, count: 1 });
        }
        return updated;
      });

      setRealtimeData(prev => {
        const newData = [...prev, {
          time: new Date(newClassification.timestamp).toLocaleTimeString(),
          value: 1
        }].slice(-15);
        return newData;
      });
    }
  }, [lastMessage]);

  const COLORS = {
    'red apple': '#850606ff',
    'green apple': '#22c55e'
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🍎🍏 Apple Classification System
          </h1>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Latest Classification */}
        {lastMessage && lastMessage.type === 'new_classification' && (
          <div className="bg-gradient-to-r from-purple-500 to-green-500 rounded-lg shadow-lg p-6 mb-6 text-white">
            <h2 className="text-xl font-semibold mb-2">Latest Classification</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold capitalize">{lastMessage.data.color}</p>
                <p className="text-sm opacity-90">
                  {new Date(lastMessage.data.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="text-6xl">
                {lastMessage.data.color === 'red apple' ? '🍇' : '🟢'}
              </div>
            </div>
          </div>
        )}

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Pie Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statistics}
                  dataKey="count"
                  nameKey="color"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.color}: ${entry.count}`}
                >
                  {statistics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.color]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Total Count
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statistics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="color" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real-time Activity */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Real-time Activity
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={realtimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Classifications Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Recent Classifications
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Color</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {classifications.slice(0, 10).map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-3 px-4 text-gray-800">{item.id}</td>
                    <td className="py-3 px-4">
                      <span
                        className="px-3 py-1 rounded-full text-white text-sm font-medium"
                        style={{ backgroundColor: COLORS[item.color] }}
                      >
                        {item.color}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(item.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;