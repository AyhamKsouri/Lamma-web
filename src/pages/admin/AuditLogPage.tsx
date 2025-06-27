import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/services/api";
import { RefreshCw, Search } from "lucide-react";
import "@/styles/auditLogPage.css";

interface AuditLogEntry {
  _id: string;
  timestamp: string;
  userId: string;
  action: string;
  resource: string;
  metadata: Record<string, any>;
}

export default function AuditLogPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<AuditLogEntry[]>("/api/auditlog/audit");
      setLogs(response);
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch audit logs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="audit-log-page p-6 min-h-screen bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Audit Logs</h1>
        <div className="flex space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute right-3 top-2 text-gray-400" />
          </div>
          <button
            onClick={fetchLogs}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Refresh
          </button>
        </div>
      </div>
      {filteredLogs.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <p>No audit logs available.</p>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 border-b">Timestamp</th>
                <th className="py-3 px-4 border-b">User ID</th>
                <th className="py-3 px-4 border-b">Action</th>
                <th className="py-3 px-4 border-b">Resource</th>
                <th className="py-3 px-4 border-b">Metadata</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50 transition duration-150">
                  <td className="py-3 px-4 border-b">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="py-3 px-4 border-b">{log.userId}</td>
                  <td className="py-3 px-4 border-b font-medium text-blue-600">{log.action}</td>
                  <td className="py-3 px-4 border-b">{log.resource}</td>
                  <td className="py-3 px-4 border-b">
                    <pre className="text-sm bg-gray-100 p-2 rounded whitespace-pre-wrap max-h-20 overflow-auto">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button
        onClick={() => navigate("/admin")}
        className="mt-6 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
      >
        Back to Admin Dashboard
      </button>
    </div>
  );
}