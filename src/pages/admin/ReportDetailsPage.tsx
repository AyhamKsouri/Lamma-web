// src/pages/admin/ReportDetailPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/services/api";
import "@/styles/adminPage.css";

interface Reporter {
  _id: string;
  email: string;
  userInfo?: { name: string };
}

interface ReportDetail {
  _id: string;
  type: "event" | "comment";
  targetId: string;
  reason: string;
  extra?: string;
  reportedAt: string;
  reporter: Reporter;
  event?: {
    title: string;
    startDate: string;
    endDate: string;
    location: string;
    description: string;
  };
  comment?: {
    message: string;
    createdAt: string;
    author?: {
      userInfo?: { name: string };
    };
  };
}

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const nav = useNavigate();

  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  setLoading(true);
  apiClient
    .get<ReportDetail>(`/api/report/${id}`)
    .then(setReport)
    .catch((err) => {
      console.error("Error fetching report:", err);
      setError(err.response?.data?.message || "Failed to load report");
    })
    .finally(() => setLoading(false));
}, [id]);


  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  if (loading) {
    return <p className="p-6 text-gray-500">Loading report…</p>;
  }
  if (error || !report) {
    return (
      <div className="p-6">
        <p className="text-red-600">Error: {error || "Report not found"}</p>
        <button onClick={() => nav(-1)} className="mt-4 btn">
          Go Back
        </button>
      </div>
    );
  }

  const reporterName  = report.reporter.userInfo?.name ?? "Unknown";
  const reporterEmail = report.reporter.email;
  const mailtoLink    = `mailto:${reporterEmail}?subject=Re:%20Report%20${report._id}`;

  return (
    <div className="admin-page space-y-6 p-6">
      <button onClick={() => nav(-1)} className="text-indigo-600 hover:underline">
        ← Back to Reports
      </button>

      <h1 className="text-3xl font-bold">Report Details</h1>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
        <p><strong>Type:</strong> {report.type.charAt(0).toUpperCase() + report.type.slice(1)}</p>
        <p><strong>Reason:</strong> {report.reason}</p>
        {report.extra && <p><strong>Details:</strong> {report.extra}</p>}
        <p><strong>Reported At:</strong> {new Date(report.reportedAt).toLocaleString()}</p>

        {/* ▶︎ SHOW THE REPORTED ENTITY */}
        {report.type === "event" && report.event && (
          <div className="p-4 bg-gray-50 rounded">
            <h2 className="text-xl font-semibold">Reported Event</h2>
            <p><strong>Title:</strong> {report.event.title}</p>
            <p>
              <strong>When:</strong>{" "}
              {new Date(report.event.startDate).toLocaleDateString()} –{" "}
              {new Date(report.event.endDate).toLocaleDateString()}
            </p>
            <p><strong>Where:</strong> {report.event.location}</p>
            <p>{report.event.description}</p>
          </div>
        )}

        {report.type === "comment" && report.comment && (
          <div className="p-4 bg-gray-50 rounded">
            <h2 className="text-xl font-semibold">Reported Comment</h2>
            <p className="mt-2">{report.comment.message}</p>
            {report.comment.author?.userInfo?.name && (
              <p className="text-sm text-gray-500">
                — by {report.comment.author.userInfo.name} on{" "}
                {new Date(report.comment.createdAt).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* ▶︎ REPORTER INFO */}
        <div className="space-y-1">
          <p className="flex items-center gap-2">
            <strong>Reported By:</strong> {reporterName}
          </p>
          <p className="flex items-center gap-2">
            <strong>Email:</strong>{" "}
            {reporterEmail ? (
              <a href={mailtoLink} className="text-indigo-600 hover:underline">
                {reporterEmail}
              </a>
            ) : (
              "Unknown"
            )}
          </p>
          {reporterEmail && (
            <a
              href={mailtoLink}
              className="inline-block px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Contact via Email
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
