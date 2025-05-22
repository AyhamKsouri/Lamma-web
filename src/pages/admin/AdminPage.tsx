// src/pages/admin/AdminPage.tsx
import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

import {
  getPlatformAnalytics,
  getDeletedEvents,
  restoreEvent,
  hardDeleteEvent,
  getDeletedMedia,
  restoreMedia,
  hardDeleteMedia,
  Analytics,
  EventRecord,
  MediaRecord,
} from "@/services/adminService";

import { useCountUp } from "@/hooks/useCountUp";  // your zero→X hook
import "@/styles/adminPage.css";

export default function AdminPage() {
  const { user } = useAuth();
  const nav = useNavigate();

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [deletedE, setDeletedE] = useState<EventRecord[]>([]);
  const [deletedM, setDeletedM] = useState<MediaRecord[]>([]);

  useEffect(() => {
    getPlatformAnalytics().then(setAnalytics).catch(console.error);
    getDeletedEvents().then(setDeletedE).catch(console.error);
    getDeletedMedia().then(setDeletedM).catch(console.error);
  }, []);

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const stats: Array<[string, number, string?]> = [
    ["Users", analytics?.totalUsers ?? 0, "/admin/users"],
    ["Events", analytics?.totalEvents ?? 0, "/admin/events"],
    ["Media", analytics?.totalMedia ?? 0],
    ["Deleted Events", analytics?.deletedEvents ?? 0],
    ["Deleted Media", analytics?.deletedMedia ?? 0],
  ];

  return (
    <div className="admin-page space-y-12 p-6">
      <h1 className="admin-page__title">Admin Dashboard</h1>

      <section className="admin-page__section">
        <h2 className="admin-page__section-title">Platform Analytics</h2>
        <div className="admin-page__analytics-cards">
          {stats.map(([label, num, path], i) => {
            const count = useCountUp(num, 800);
            const click = Boolean(path);
            const delay = `delay-${(i + 1) * 100}`;

            return (
              <div
                key={label}
                onClick={() => click && nav(path!)}
                className={`
                  analytics-card
                  animate-slide-up ${delay}
                  ${click ? "cursor-pointer hover:-translate-y-10 hover:shadow-xl" : ""}
                    transform transition duration-200
                `}
              >
                <span className="analytics-card__label">{label}</span>
                <span className="analytics-card__value">{count}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="admin-page__section">
        <h2 className="admin-page__section-title">Deleted Events</h2>
        {deletedE.length === 0 ? (
          <p className="text-gray-500">No deleted events.</p>
        ) : (
          deletedE.map(ev => (
            <div key={ev._id} className="deleted-item animate-slide-up delay-200">
              <div className="deleted-item-card__content">
                <img
                  src={ev.bannerUrl || "/default-event-banner.jpg"}
                  alt={ev.title}
                  className="deleted-item-card__banner"
                />
                <div className="deleted-item-card__info">
                  <h3 className="deleted-item-card__title">{ev.title}</h3>
                  <p className="deleted-item-card__dates">
                    {new Date(ev.startDate).toLocaleDateString()} –{" "}
                    {new Date(ev.endDate).toLocaleDateString()}
                  </p>
                  <p className="deleted-item-card__location">{ev.location}</p>
                  <p className="deleted-item-card__description">{ev.description}</p>
                </div>
              </div>
              <div className="deleted-item-card__actions">
                <button
                  className="btn-restore"
                  onClick={() =>
                    restoreEvent(ev._id).then(() =>
                      setDeletedE(ds => ds.filter(x => x._id !== ev._id))
                    )
                  }
                >
                  Restore
                </button>
                <button
                  className="btn-delete"
                  onClick={() =>
                    hardDeleteEvent(ev._id).then(() =>
                      setDeletedE(ds => ds.filter(x => x._id !== ev._id))
                    )
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
        <h2 className="admin-page__section-title">Deleted Media</h2>
        {deletedM.length === 0 ? (
          <p className="text-gray-500">No deleted media.</p>
        ) : (
          deletedM.map(m => (
            <div key={m._id} className="deleted-item animate-slide-up">
              <div className="deleted-item-card__content">
                <img
                  src={m.url || "/fallback-image.png"}
                  alt={m.filename || m._id}
                  className="deleted-item-card__banner"
                />
                <div className="deleted-item-card__info">
                  <h3 className="deleted-item-card__title">{m.filename || m._id}</h3>
                </div>
              </div>
              <div className="deleted-item-card__actions">
                <button
                  className="btn-restore"
                  onClick={() =>
                    restoreMedia(m._id).then(() =>
                      setDeletedM(dm => dm.filter(x => x._id !== m._id))
                    )
                  }
                >
                  Restore
                </button>
                <button
                  className="btn-delete"
                  onClick={() =>
                    hardDeleteMedia(m._id).then(() =>
                      setDeletedM(dm => dm.filter(x => x._id !== m._id))
                    )
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
