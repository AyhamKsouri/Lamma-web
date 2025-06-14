// src/pages/user/CreatorEventDetails.tsx

import React, { FC, useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "@/services/api";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { Trash2, Edit2, MapPin, Users, Send } from "lucide-react";
import { toast } from "react-hot-toast";
import { Clock } from "lucide-react";
import * as reservationService from "@/services/reservationService";


interface UserData {
    _id: string;
    email?: string;
    userInfo?: {
        name?: string;
        profileImage?: string;
    };
}

interface Guest {
    user: UserData;
    rsvp: "yes" | "no" | "maybe" | "pending";
}

interface Comment {
    _id: string;
    author: UserData;
    message: string;
    createdAt: string;
}

interface EventData {
    _id: string;
    title: string;
    startDate: string;
    startTime: string;
    location: string;
    bannerUrl: string;
    photos?: string[];
    createdBy?: UserData;
    guests?: Guest[];
}

const CreatorEventDetails: FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [event, setEvent] = useState<EventData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({
        title: "",
        startDate: "",
        startTime: "",
        location: "",
    });
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [photoFiles, setPhotoFiles] = useState<File[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentText, setCommentText] = useState("");
    const [commentError, setCommentError] = useState("");
    const [showGuestManager, setShowGuestManager] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [reservations, setReservations] = useState<reservationService.Reservation[]>([]);


    // 1) Load event + comments
    useEffect(() => {
        if (!id) return;
        setLoading(true);
        Promise.all([
            api.get<EventData>(`/api/event/${id}`),
            api.get<Comment[]>(`/api/comments/${id}`),
        ])
            .then(([eRes, cRes]) => {
                const ev = eRes.data;
                setEvent(ev);
                setComments(cRes.data);
                setForm({
                    title: ev.title,
                    startDate: ev.startDate.slice(0, 10),
                    startTime: ev.startTime,
                    location: ev.location,
                });
            })
            .catch(() => setError("Failed to load event."))
            .finally(() => setLoading(false));
    }, [id]);

    // 2) Redirect non-creators
    useEffect(() => {
        if (event && user) {
            if (event.createdBy?._id !== user._id) {
                navigate(`/events/${event._id}`, { replace: true });
            }
        }
    }, [event, user, navigate]);
    useEffect(() => {
        if (!id) return;
        reservationService.getEventReservations(id)
            .then(res => setReservations(res.data))
            .catch(console.error);
    }, [id]);

    // Handlers

    const handleFieldChange = (field: keyof typeof form, value: string) => {
        setForm(f => ({ ...f, [field]: value }));
    };

    const handleUpdateEvent = async () => {
        if (!event) return;
        try {
            // 2a. Update text fields
            await api.put(`/api/event/${id}`, {
                title: form.title,
                startDate: form.startDate,
                startTime: form.startTime,
                location: form.location,
            });
            // 2b. Banner upload
            if (bannerFile) {
                const bd = new FormData();
                bd.append("banner", bannerFile);
                await api.patch(`/api/event/${id}/banner`, bd, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }
            // 2c. Photos upload
            if (photoFiles.length) {
                const pd = new FormData();
                photoFiles.forEach(f => pd.append("photos", f));
                await api.post(`/api/event/${id}/photos`, pd, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }
            // 2d. Refresh
            const refreshed = (await api.get<EventData>(`/api/event/${id}`)).data;
            setEvent(refreshed);
            setIsEditing(false);
            setBannerFile(null);
            setPhotoFiles([]);
        } catch {
            alert("Failed to save changes");
        }
    };
    const updateStatus = async (resId: string, status: reservationService.Reservation["status"]) => {
        try {
            const { data } = await reservationService.respondToReservation(resId, status);
            setReservations(rs => rs.map(r => r._id === resId ? data : r));
            toast.success(`Reservation ${status}`);
        } catch {
            toast.error("Failed to update status");
        }
    };


    const handleAddComment = async () => {
        if (!commentText.trim() || !event || !user) {
            setCommentError("Comment cannot be empty");
            return;
        }
        try {
            const now = new Date().toISOString();
            const res = await api.post(`/api/comments/${id}`, {
                message: commentText.trim(),
                eventId: id,
            });
            const newComment: Comment = {
                _id: res.data._id,
                author: { _id: user._id, email: user.email, userInfo: user.userInfo },
                message: commentText.trim(),
                createdAt: now,
            };
            setComments(c => [newComment, ...c]);
            setCommentText("");
            setCommentError("");
        } catch {
            setCommentError("Failed to add comment");
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!window.confirm("Delete this comment?") || !event) return;
        await api.delete(`/api/comments/${commentId}`);
        setComments(c => c.filter(x => x._id !== commentId));
    };

    const handleRemoveGuest = async (userId: string) => {
        if (!window.confirm("Remove this guest?") || !event) return;
        await api.delete(`/api/event/${id}/guest/${userId}`);
        setEvent(e => e && { ...e, guests: e.guests?.filter(g => g.user._id !== userId) });
    };

    // src/pages/user/CreatorEventDetails.tsx
    async function handleInvite() {
        if (!inviteEmail.trim() || !event) return;

        try {
            const { data } = await api.post<{ guests: Guest[]; message: string }>(
                `/api/event/${id}/invite`,
                { email: inviteEmail.trim() }
            );

            setEvent(e => e
                ? { ...e, guests: data.guests }
                : e
            );

            toast.success(data.message);


            // 3) Clear the input
            setInviteEmail("");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to send invite");
        }
    }



    // Render

    if (loading) return <p>Loading…</p>;
    if (error || !event) return <p className="text-red-500">{error || "Event not found."}</p>;

    return (
        <div className="max-w-3xl mx-auto py-6 space-y-6">
            <Link to="/" className="text-indigo-600 hover:underline flex items-center">
                ← Back to Home
            </Link>

            {/* Edit toggle */}
            <div className="flex justify-end">
                <Button
                    variant="outline"
                    onClick={() => setIsEditing(e => !e)}
                    className="flex items-center space-x-1"
                >
                    <Edit2 size={16} />
                    <span>{isEditing ? "Cancel" : "Edit Event"}</span>
                </Button>
            </div>

            {/* Banner */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
                <img src={event.bannerUrl} alt={event.title} className="w-full h-64 object-cover" />
                {isEditing && (
                    <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 p-2 rounded">
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={e => e.target.files && setBannerFile(e.target.files[0])}
                        />
                    </div>
                )}
            </div>

            {/* Details Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4">
                {isEditing ? (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <Input
                                value={form.title}
                                onChange={e => handleFieldChange("title", e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm mb-1">Date</label>
                                <Input
                                    type="date"
                                    value={form.startDate}
                                    onChange={e => handleFieldChange("startDate", e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Time</label>
                                <Input
                                    type="time"
                                    value={form.startTime}
                                    onChange={e => handleFieldChange("startTime", e.target.value)}
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm mb-1 flex items-center space-x-1">
                                <MapPin size={16} />
                                <span>Location</span>
                            </label>
                            <Input
                                value={form.location}
                                onChange={e => handleFieldChange("location", e.target.value)}
                                className="w-full"
                            />
                        </div>
                        {/* Live map preview */}
                        <div className="w-full h-48 rounded-lg overflow-hidden shadow-inner">
                            <iframe
                                title="Map preview"
                                className="w-full h-full"
                                src={`https://www.google.com/maps?q=${encodeURIComponent(
                                    form.location
                                )}&output=embed`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Add Photos</label>
                            <Input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={e =>
                                    e.target.files && setPhotoFiles(Array.from(e.target.files))
                                }
                            />
                        </div>
                        <Button onClick={handleUpdateEvent}>Save Changes</Button>
                    </>
                ) : (
                    <>
                        <h1 className="text-3xl font-bold">{event.title}</h1>
                        <p className="flex items-center space-x-1 text-gray-600">
                            <MapPin size={16} />
                            <span>{event.location}</span>
                        </p>
                        <p className="text-gray-600">
                            {format(new Date(event.startDate), "yyyy-MM-dd")} •{" "}
                            {event.startTime}
                        </p>
                        <div className="w-full h-48 rounded-lg overflow-hidden shadow-inner">
                            <iframe
                                title="Event Location"
                                className="w-full h-full"
                                src={`https://www.google.com/maps?q=${encodeURIComponent(
                                    event.location
                                )}&output=embed`}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Photo Gallery */}
            {event.photos?.length ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
                    <h2 className="text-xl font-semibold mb-3">Photos</h2>
                    <div className="flex gap-3 overflow-x-auto">
                        {event.photos.map((src, i) => (
                            <img
                                key={i}
                                src={src}
                                alt={`Photo ${i + 1}`}
                                className="w-32 h-24 object-cover rounded-lg shadow-sm flex-shrink-0"
                            />
                        ))}
                    </div>
                </div>
            ) : null}
            {/* Guest & Reservation Manager trigger */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
                <div className="flex items-center space-x-2">
                    <Users size={20} />
                    <span className="font-medium">
                        Guests ({event.guests?.length ?? 0}) • Requests ({reservations.length})
                    </span>
                </div>
                <Button
                    onClick={() => setShowGuestManager(true)}
                    disabled={isEditing}
                    className={isEditing ? "opacity-50 cursor-not-allowed" : "…your gradient classes…"}
                >
                    Manage
                </Button>

            </div>



            {/* Comments Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 space-y-4">
                <h2 className="text-xl font-semibold">Comments</h2>

                {/* Existing Comments */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                    {comments.length > 0 ? (
                        comments.map(c => (
                            <div
                                key={c._id}
                                className="flex justify-between items-start bg-gray-50 dark:bg-gray-700 p-3 rounded"
                            >
                                <div>
                                    <p className="font-medium">
                                        {c.author.userInfo?.name || c.author.email}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {format(new Date(c.createdAt), "yyyy-MM-dd HH:mm")}
                                    </p>
                                    <p className="mt-1">{c.message}</p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="text-red-500"
                                    onClick={() => handleDeleteComment(c._id)}
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center">No comments yet.</p>
                    )}
                </div>

                {/* Add New Comment */}
                <div className="flex space-x-2 mt-4">
                    <Input
                        placeholder="Add a comment…"
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleAddComment()}
                    />
                    <Button
                        onClick={handleAddComment}
                        className="
                            bg-gradient-to-r from-teal-400 to-blue-500
                            text-white font-semibold
                            px-4 py-2
                            rounded-full shadow
                            hover:scale-105 transform transition duration-200
                        "
                    >
                        <Send size={16} className="inline-block mr-1" />
                        Post
                    </Button>
                </div>
            </div>
            {/* Guest Manager Modal */}
            {showGuestManager && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 flex items-start justify-center p-6"
                    onClick={() => setShowGuestManager(false)}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold mb-4">Guest & Reservations Manager</h3>
                        {/* Pending Invitations*/}
                        <ul className="space-y-2 max-h-64 overflow-y-auto">
                            {event.guests?.length ? (
                                event.guests.map(g => (
                                    <li
                                        key={g.user._id}
                                        className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded"
                                    >
                                        <div className="flex items-center space-x-2">
                                            {g.rsvp === "pending" && (
                                                <Clock size={16} className="text-blue-400" />
                                            )}
                                            <span>
                                                {g.user.userInfo?.name || g.user.email}
                                            </span>
                                        </div>
                                        {g.rsvp !== "pending" ? (
                                            <Button
                                                variant="outline"
                                                className="text-red-500 px-2 py-1 text-xs"
                                                onClick={() => handleRemoveGuest(g.user._id)}
                                            >
                                                Remove
                                            </Button>
                                        ) : (
                                            <span className="text-xs italic text-blue-400">
                                                Invited
                                            </span>
                                        )}
                                    </li>
                                ))
                            ) : (
                                <li className="text-center text-gray-500">No guests yet.</li>
                            )}
                        </ul>
                        {/* Reservation approvals */}
                        <h3 className="text-lg font-semibold mb-4">Reservation Requests</h3>
                        <ul className="space-y-2 max-h-64 overflow-y-auto">
                            {reservations.map(r => (
                                <li key={r._id} className="flex justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                    <div>
                                        <p>{r.user.userInfo?.name || r.user.email}</p>
                                        <p className="text-sm text-gray-500">Party: {r.numberOfPeople}</p>
                                    </div>
                                    <div className="flex space-x-1">
                                        {["confirmed", "rejected", "canceled"].map(s => (
                                            <button
                                                key={s}
                                                onClick={() => updateStatus(r._id, s as any)}
                                                className={`px-2 py-1 text-xs rounded 
              ${r.status === s
                                                        ? "bg-indigo-600 text-white"
                                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                                            >
                                                {s.charAt(0).toUpperCase() + s.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-4">
                            <label className="block mb-1 text-sm">Invite by email</label>
                            <div className="flex space-x-2">
                                <Input
                                    type="email"
                                    placeholder="user@example.com"
                                    value={inviteEmail}
                                    onChange={e => setInviteEmail(e.target.value)}
                                />
                                <Button onClick={handleInvite}>Send</Button>
                            </div>
                        </div>

                        <div className="mt-6 text-right">
                            <Button
                                variant="outline"
                                onClick={() => setShowGuestManager(false)}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreatorEventDetails;
