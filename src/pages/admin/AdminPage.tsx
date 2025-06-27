import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { FileText, RefreshCw } from "lucide-react";

import {
  getPlatformAnalytics,
  getSoftDeletedEvents, // Updated to fetch soft-deleted events
  restoreEvent,
  hardDeleteEvent,
  getDeletedMedia,
  restoreMedia,
  hardDeleteMedia,
  Analytics,
  EventRecord,
  MediaRecord,
  logEvent,
} from "@/services/adminService";

import { useCountUp } from "@/hooks/useCountUp";
import "@/styles/adminPage.css";

export default function AdminPage() {
  const { user } = useAuth();
  const nav = useNavigate();

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [softDeletedEvents, setSoftDeletedEvents] = useState<EventRecord[]>([]); // Renamed for clarity
  const [deletedM, setDeletedM] = useState<MediaRecord[]>([]);

  useEffect(() => {
    getPlatformAnalytics().then(setAnalytics).catch(console.error);
    getSoftDeletedEvents().then(setSoftDeletedEvents).catch(console.error);
    getDeletedMedia().then(setDeletedM).catch(console.error);
  }, []);

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  const refreshAll = async () => {
    try {
      const [newAnalytics, newSoftEvents, newDeletedMedia] = await Promise.all([
        getPlatformAnalytics(),
        getSoftDeletedEvents(),
        getDeletedMedia(),
      ]);
      setAnalytics(newAnalytics);
      setSoftDeletedEvents(newSoftEvents);
      setDeletedM(newDeletedMedia);
    } catch (err) {
      console.error("Failed to refresh:", err);
    }
  };

  const stats: Array<[string, number, string?]> = [
    ["Users", analytics?.totalUsers ?? 0, "/admin/users"],
    ["Events", analytics?.totalEvents ?? 0, "/admin/events"],
    ["Media", analytics?.totalMedia ?? 0],
    ["Soft Deleted Events", analytics?.deletedEvents ?? 0], // Updated label
    ["Deleted Media", analytics?.deletedMedia ?? 0],
  ];
  useEffect(() => {
    refreshAll();
  }, []);

  return (
    <div className="admin-page min-h-screen bg-gray-50 p-6 space-y-12">
      <h1 className="admin-page__title text-4xl font-extrabold text-gray-900">Admin Dashboard</h1>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Platform Analytics</h2>
        <div className="space-x-4">
          <button
            onClick={() => nav("/admin/reports")}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-600     transform hover:-translate-y-0.5 hover:scale-105
    transition-all duration-200
"
          >
            <FileText className="w-6 h-6 mr-2" />
            View Reports
          </button>
          <button
            onClick={() => nav("/admin/audit")}
            className="
    inline-flex items-center
    px-6 py-3
    bg-gradient-to-r from-purple-500 to-indigo-500
    text-white font-semibold
    rounded-lg shadow-lg
    transform hover:-translate-y-0.5 hover:scale-105
    transition-all duration-200
  "
          >
            <FileText className="w-6 h-6 mr-2" />
            View Audit Logs
          </button>
          <button
            onClick={refreshAll}
            className="
     inline-flex items-center px-4 py-2
     bg-gray-500 text-white rounded-lg
     hover:bg-gray-600 transition duration-300
   "
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Refresh All
          </button>
        </div>
      </div>
      <section className="admin-page__section">
        <h2 className="admin-page__section-title text-2xl font-semibold text-gray-700">Platform Analytics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {stats.map(([label, num, path], i) => {
            const count = useCountUp(num, 800);
            const click = Boolean(path);
            const delay = `delay-${(i + 1) * 100}`;

            return (
              <div
                key={label}
                onClick={() => click && nav(path!)}
                className={`
                  analytics-card bg-white p-6 rounded-lg shadow-md hover:shadow-lg
                  ${click ? "cursor-pointer" : ""} ${delay} transition-all duration-300
                `}
              >
                <span className="text-gray-600 text-sm">{label}</span>
                <span className="text-2xl font-bold text-gray-900 mt-2 block">{count}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="admin-page__section">
        <h2 className="admin-page__section-title text-2xl font-semibold text-gray-700">Soft Deleted Events</h2>
        {softDeletedEvents.length === 0 ? (
          <p className="text-gray-500 text-center py-6 bg-white rounded-lg shadow-md">No soft deleted events.</p>
        ) : (
          softDeletedEvents.map((ev) => (
            <div
              key={ev._id}
              className="deleted-item bg-white rounded-lg shadow-md p-4 mb-4 hover:shadow-lg transition duration-300"
            >
              <div className="flex flex-col md:flex-row items-center">
                <img
                  src={ev.bannerUrl || "/default-event-banner.jpg"}
                  alt={ev.title}
                  className="w-32 h-20 object-cover rounded-lg mr-4 mb-2 md:mb-0"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-800">{ev.title}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(ev.startDate).toLocaleDateString()} –{" "}
                    {new Date(ev.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">{ev.location}</p>
                  <p className="text-sm text-gray-500">{ev.description}</p>
                </div>
              </div>
              <div className="mt-4 flex space-x-4">
                <button
                  className="btn-restore bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300"
                  onClick={() =>
                    restoreEvent(ev._id).then(() => {
                      setSoftDeletedEvents(ds => ds.filter(x => x._id !== ev._id));
                      logEvent({
                        userId: user?._id || 'unknown',
                        action: 'RESTORE_EVENT',
                        resource: `Event-${ev._id}`,
                        metadata: { title: ev.title },
                      });
                    })
                  }
                >
                  Restore
                </button>
                <button
                  className="btn-delete bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
                  onClick={() =>
                    hardDeleteEvent(ev._id).then(() => {
                      setSoftDeletedEvents(ds => ds.filter(x => x._id !== ev._id));
                      logEvent({
                        userId: user?._id || 'unknown',
                        action: 'HARD_DELETE_EVENT',
                        resource: `Event-${ev._id}`,
                        metadata: { title: ev.title },
                      });
                    })
                  }
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      <section className="admin-page__section">
        <h2 className="admin-page__section-title text-2xl font-semibold text-gray-700">Deleted Media</h2>
        {deletedM.length === 0 ? (
          <p className="text-gray-500 text-center py-6 bg-white rounded-lg shadow-md">No deleted media.</p>
        ) : (
          deletedM.map((m) => (
            <div
              key={m._id}
              className="deleted-item bg-white rounded-lg shadow-md p-4 mb-4 hover:shadow-lg transition duration-300"
            >
              <div className="flex flex-col md:flex-row items-center">
                <img
                  src={m.url || "/fallback-image.png"}
                  alt={m.filename || m._id}
                  className="w-32 h-20 object-cover rounded-lg mr-4 mb-2 md:mb-0"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-800">{m.filename || m._id}</h3>
                </div>
              </div>
              <div className="mt-4 flex space-x-4">
                <button
                  className="btn-restore bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300"
                  onClick={() =>
                    restoreMedia(m._id).then(() => {
                      setDeletedM(dm => dm.filter(x => x._id !== m._id));
                      logEvent({
                        userId: user?._id || 'unknown',
                        action: 'RESTORE_MEDIA',
                        resource: `Media-${m._id}`,
                        metadata: { filename: m.filename },
                      });
                    })
                  }
                >
                  Restore
                </button>
                <button
                  className="btn-delete bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
                  onClick={() =>
                    hardDeleteMedia(m._id).then(() => {
                      setDeletedM(dm => dm.filter(x => x._id !== m._id));
                      logEvent({
                        userId: user?._id || 'unknown',
                        action: 'HARD_DELETE_MEDIA',
                        resource: `Media-${m._id}`,
                        metadata: { filename: m.filename },
                      });
                    })
                  }
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}