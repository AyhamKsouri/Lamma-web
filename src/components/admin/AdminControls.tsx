// src/pages/admin/AdminPage.tsx
import React, { useEffect, useState } from 'react';
import {
  getPlatformAnalytics,
  getDeletedEvents,
  restoreEvent,
  hardDeleteEvent,
  getDeletedMedia,
  restoreMedia,
  hardDeleteMedia
} from '@/services/adminService';
import '@/styles/adminpage.css'; // adjust relative path as needed

export default function AdminPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [deletedEvents, setDeletedEvents] = useState<any[]>([]);
  const [deletedMedia, setDeletedMedia] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      setAnalytics(await getPlatformAnalytics());
      setDeletedEvents(await getDeletedEvents());
      setDeletedMedia(await getDeletedMedia());
    })();
  }, []);

  const handleRestoreEvent = async (id: string) => {
    await restoreEvent(id);
    setDeletedEvents(await getDeletedEvents());
  };
  const handleDeleteEvent = async (id: string) => {
    await hardDeleteEvent(id);
    setDeletedEvents(await getDeletedEvents());
  };

  const handleRestoreMedia = async (id: string) => {
    await restoreMedia(id);
    setDeletedMedia(await getDeletedMedia());
  };
  const handleDeleteMedia = async (id: string) => {
    await hardDeleteMedia(id);
    setDeletedMedia(await getDeletedMedia());
  };

  if (!analytics) {
    return <p className="admin-container">Loading admin dashboard…</p>;
  }

  return (
    <div className="admin-container">
      <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>

      {/* Top-level stats */}
      <div className="admin-grid">
        <div className="admin-card">
          <h2>Platform Analytics</h2>
          <ul className="admin-list">
            <li><span>Users</span><span>{analytics.totalUsers}</span></li>
            <li><span>Events</span><span>{analytics.totalEvents}</span></li>
            <li><span>Media</span><span>{analytics.totalMedia}</span></li>
            <li><span>Deleted Events</span><span>{analytics.deletedEvents}</span></li>
            <li><span>Deleted Media</span><span>{analytics.deletedMedia}</span></li>
          </ul>
        </div>
      </div>

      {/* Deleted Events */}
      <section className="admin-section">
        <h3>Deleted Events</h3>
        <table className="admin-table bg-gray-800 text-white">
          <thead>
            <tr>
              <th>ID</th><th>Title</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deletedEvents.map(ev => (
              <tr key={ev._id}>
                <td>{ev._id.slice(-6)}</td>
                <td>{ev.title}</td>
                <td className="space-x-2">
                  <button
                    className="admin-btn restore"
                    onClick={() => handleRestoreEvent(ev._id)}
                  >Restore</button>
                  <button
                    className="admin-btn delete"
                    onClick={() => handleDeleteEvent(ev._id)}
                  >Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Deleted Media */}
      <section className="admin-section">
        <h3>Deleted Media</h3>
        <table className="admin-table bg-gray-800 text-white">
          <thead>
            <tr>
              <th>ID</th><th>Filename</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deletedMedia.map(md => (
              <tr key={md._id}>
                <td>{md._id.slice(-6)}</td>
                <td>{md.filename || '—'}</td>
                <td className="space-x-2">
                  <button
                    className="admin-btn restore"
                    onClick={() => handleRestoreMedia(md._id)}
                  >Restore</button>
                  <button
                    className="admin-btn delete"
                    onClick={() => handleDeleteMedia(md._id)}
                  >Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
