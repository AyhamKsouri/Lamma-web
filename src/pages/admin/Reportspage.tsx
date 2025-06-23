// src/pages/admin/ReportsPage.tsx

import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import "@/styles/adminPage.css";
import { apiClient } from "@/services/api";
import { Link,useNavigate } from "react-router-dom";


// src/pages/admin/ReportsPage.tsx
interface UserInfo {
    name: string;
}

interface Reporter {
    _id: string;
    userInfo: { name: string };
}

interface Report {
    _id: string;
    type: "event" | "comment";
    targetId: string;
    reason: string;
    extra?: string;
    reportedAt: string;
    reporter: Reporter;
}


export default function ReportsPage() {
    const { user } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "event" | "comment">("all");
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        apiClient
            .get<Report[]>("/api/report")
            .then((data) => {
                setReports(data);
            })
            .catch((error) => {
                console.error("Error fetching reports:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (user?.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    const filteredReports = reports.filter((r) =>
        filter === "all" ? true : r.type === filter
    );

    return (
        <div className="admin-page space-y-12 p-6">
            <h1 className="text-3xl font-bold">Reports</h1>

            {/* Filter Tabs */}
            <div className="flex gap-4 mb-6">
                {(["all", "event", "comment"] as const).map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`px-4 py-2 rounded-full text-sm transition-all ${filter === type
                            ? "bg-blue-600 text-white shadow-lg"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                            }`}
                    >
                        {type === "all"
                            ? "All Reports"
                            : type === "event"
                                ? "Event Reports"
                                : "Comment Reports"}
                    </button>
                ))}
            </div>

            <section className="admin-page__section">
                {loading ? (
                    <p className="text-gray-400">Loading reports…</p>
                ) : filteredReports.length === 0 ? (
                    <p className="text-gray-500">No reports found.</p>
                ) : (
                    filteredReports.map((report, idx) => {
                        const reporterName =
                            report.reporter?.userInfo?.name;

                        return (
                            <div
                                key={report._id}
                                className={`deleted-item animate-slide-up delay-${(idx + 1) * 100}`}
                            >
                                <div className="deleted-item-card__content">
                                    <div className="deleted-item-card__info">
                                        <h3 className="deleted-item-card__title">
                                            {report.type.charAt(0).toUpperCase() +
                                                report.type.slice(1)}{" "}
                                            Report
                                        </h3>
                                        {report.reporter?.userInfo?.name && (
                                            <div className="flex items-center gap-2 mb-2">
                                                <strong>Reported by:</strong>
                                                <Link
                                                    to={`/profile/${report.reporter._id}`}
                                                    className="text-indigo-600 hover:underline"
                                                >
                                                    {report.reporter.userInfo.name}
                                                </Link>
                                            </div>
                                        )}
                                        <p>
                                            <strong>Reason:</strong> {report.reason}
                                        </p>
                                        {report.extra && (
                                            <p>
                                                <strong>Details:</strong> {report.extra}
                                            </p>
                                        )}
                                        <p>
                                            <strong>Date:</strong>{" "}
                                            {new Date(report.reportedAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="deleted-item-card__actions">
                                    <button
                                        className="btn-restore"
                                        onClick={() =>
                                            setReports((prev) =>
                                                prev.filter((r) => r._id !== report._id)
                                            )
                                        }
                                    >
                                        Dismiss
                                    </button>
                                    <button
                                        className="btn-delete"
                                        onClick={() =>
                                           navigate(`/admin/reports/${report._id}`)
                                        }
                                    >
                                        View Item
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </section>
        </div>
    );
}
