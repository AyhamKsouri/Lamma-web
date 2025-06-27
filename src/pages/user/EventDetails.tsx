import React, { FC, useState, useRef, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "@/services/api";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import * as reservationService from "@/services/reservationService";
import { toast } from "react-hot-toast";
const DEFAULT_BANNER = '/default-event-banner.jpg';
const API = import.meta.env.VITE_API_URL || '';
import ReportModal from "@/components/reportModal";
import FeedbackSection from "@/components/FeedbackSection";

// Helper to normalize a photo filename into a real <img> src
function resolvePhoto(src: string) {
  if (src.startsWith('http')) return src;
  return `${API}/uploads/eventPhotos/${src}`;
}

interface UserData {
  _id: string;
  email: string;
  userInfo?: {
    name?: string;
    profileImage?: string;
  };
}

interface Guest {
  user: UserData;
  rsvp: "yes" | "no" | "maybe";
}

interface Comment {
  _id: string;
  author: UserData;
  message: string;
  createdAt: string;
  date: string;
  likes?: string[];
}

interface Media {
  _id: string;
  url: string;
  uploadedBy: UserData;
  createdAt: string;
  likes: string[];
  isLiked?: boolean;
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
  likes?: string[];
  visibility?: string;
  isLiked?: boolean;
  likesCount?: number;
}

const EventDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [reservationState, setReservationState] = useState<"yes" | "maybe" | "no" | null>(null);
  const [showReservationMsg, setShowReservationMsg] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState("");
  const [copyError, setCopyError] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [media, setMedia] = useState<Media[]>([]);
  const [mediaUploadError, setMediaUploadError] = useState("");
  const commentEndRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const mediaGalleryRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showGuestList, setShowGuestList] = useState(false);
  const navigate = useNavigate();
  const [partySize, setPartySize] = useState(1);
  const [reservation, setReservation] = useState<reservationService.Reservation | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportData, setReportData] = useState<{ type: "event" | "comment" | "media"; id: string } | null>(null);

  useEffect(() => {
  if (!id) {
    setError("No event ID provided.");
    setLoading(false);
    return;
  }
  setLoading(true);
  Promise.all([
    api.get<EventData>(`/api/event/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),
    api.get<Comment[]>(`/api/comments/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),
    api.get<Media[]>(`/api/eventmedia/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).catch(err => {
      console.error("Media fetch error:", err.response?.data || err);
      return { data: [] };
    }),
  ])
    .then(([eventRes, commentsRes, mediaRes]) => {
      setEvent(eventRes.data);
      setComments(commentsRes.data);
      setMedia(mediaRes.data.map(m => ({
        ...m,
        isLiked: user?._id ? m.likes.includes(user._id) : false,
      })));
      setLikesCount(eventRes.data?.likesCount || 0);
      const currentUserId = user?._id || localStorage.getItem("userId");
      if (currentUserId && eventRes.data?.likes) {
        setIsLiked(eventRes.data.likes.includes(currentUserId));
      }
      const userReservation = eventRes.data?.guests?.find(g => g.user._id === currentUserId);
      setReservationState(userReservation ? "yes" : null);
    })
    .catch(err => {
      console.error("Overall fetch error:", err);
      setError("Failed to load event or comments.");
    })
    .finally(() => setLoading(false));
}, [id, user]);

  const isPast = event
    ? new Date(event.startDate).getTime() < Date.now()
    : false;

  useEffect(() => {
    if (event && user && event.createdBy?._id === user._id) {
      navigate(`/events/${event._id}/creator`, { replace: true });
    }
  }, [event, user, navigate]);

  useEffect(() => {
    commentEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  async function handleMyRSVP(choice: "yes" | "maybe" | "no") {
    if (!id) return;
    try {
      const { data } = await api.post<{ guests: Guest[] }>(
        `/api/event/${id}/rsvp`,
        { status: choice }
      );
      setEvent(e => e ? { ...e, guests: data.guests } : e);
      toast.success(`RSVP set to "${choice}"!`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to update RSVP");
    }
  }

  const handleToggleLike = async () => {
    if (!id) return;
    try {
      const response = await api.post(`/api/event/${id}/like`);
      setIsLiked(!isLiked);
      setLikesCount(response.data.likes?.length || 0);
    } catch (err) {
      console.error("Failed to toggle like:", err);
      setError("Failed to toggle like.");
    }
  };

 const handleMediaLike = async (mediaId: string) => {
  if (!user) return;
  try {
    const response = await api.put(`/api/eventmedia/${mediaId}/like`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    setMedia(prev =>
      prev.map(m =>
        m._id === mediaId ? { ...m, isLiked: !m.isLiked, likes: response.data.likes } : m
      )
    );
    toast.success("Media like updated!");
  } catch (err: any) {
    console.error("Failed to toggle media like:", err.response?.data || err);
    toast.error("Failed to like media.");
  }
};

  const handleUploadMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!id || !user || !e.target.files?.length || !isPast) return; // Only for past events
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("media", file);
    formData.append("event", id); // Match req.body.event

    try {
      const response = await api.post(`/api/eventmedia/media`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newMedia: Media = {
        ...response.data[0], // Adjust based on service response (array from insertMany)
        isLiked: false,
        uploadedBy: {
          _id: user._id,
          email: user.email,
          userInfo: {
            name: user.userInfo?.name || user.name || "Anonymous",
            profileImage: user.userInfo?.profileImage || "",
          },
        },
      };
      setMedia(prev => [newMedia, ...prev]);
      setMediaUploadError("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Media uploaded successfully!");
    } catch (err: any) {
      console.error("Media upload error:", err.response?.data || err);
      setMediaUploadError(err.response?.data?.message || "Failed to upload media.");
      toast.error("Failed to upload media.");
    }
  };
  const handleReserve = async () => {
    try {
      const res = await reservationService.makeReservation(id!, partySize);
      setReservation(res.data);
      toast.success("Reservation created!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to reserve");
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      setCommentError("Comment cannot be empty");
      return;
    }
    if (!user) {
      setCommentError("Please log in to add a comment");
      return;
    }
    try {
      const now = new Date().toISOString();
      const response = await api.post(`/api/comments/${id}`, {
        message: commentText.trim(),
        eventId: id,
      });
      const newComment: Comment = {
        _id: response.data._id,
        author: {
          _id: user._id,
          email: user.email || "anonymous@example.com",
          userInfo: {
            name: user.userInfo?.name || user.name || user.email || "Anonymous",
            profileImage: user.userInfo?.profileImage || user.profileImage || "",
          },
        },
        message: commentText.trim(),
        createdAt: now,
        date: now,
        likes: [],
      };
      setComments(prev => [newComment, ...prev]);
      setCommentText("");
      setCommentError("");
    } catch (err: any) {
      console.error("Comment error:", err);
      if (err.response?.status === 401) {
        setCommentError("Your session has expired. Please log in again.");
      } else {
        setCommentError(err.response?.data?.message || "Failed to add comment. Please try again.");
      }
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyError("");
      alert("Link copied to clipboard!");
    } catch {
      setCopyError("Failed to copy link");
    }
  };

  if (loading) {
    return <div className="p-6"><p>Loading event…</p></div>;
  }

  if (error || !event) {
    return (
      <div className="p-6">
        <p className="text-red-500">{error || "Event not found."}</p>
        <Link to="/" className="text-indigo-600 hover:underline">← Back to Home</Link>
      </div>
    );
  }

  const displayDate = `${new Date(event.startDate).toLocaleDateString()} • ${event.startTime}`;

  return (
    <>
      <div className="max-w-4xl mx-auto py-6 px-4 space-y-6 animate-fade-in">
        {/*─── PAST/EVENT FLAG ───────────────────────────────────────────────*/}
        {isPast && (
          <p className="text-center text-yellow-600 font-semibold">
            This event has passed — details are now static. Feel free to leave your feedback below!
          </p>
        )}
        <Link to="/" className="text-indigo-600 hover:underline">← Back to Home</Link>

        {/* Banner */}
        <div className="rounded-lg overflow-hidden shadow-lg">
          <img
            src={
              event.photos?.[0]
                ? resolvePhoto(event.photos[0])
                : DEFAULT_BANNER
            }
            alt={event.title}
            className="w-full h-64 object-cover"
            loading="lazy"
            onError={e => {
              (e.currentTarget as HTMLImageElement).src = DEFAULT_BANNER;
            }}
          />
        </div>

        {/* Title & Info */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <p className="text-gray-600">{displayDate}</p>
          <p className="text-gray-600 truncate">{event.location}</p>
          {isPast && (
            <p className="text-sm text-gray-500 italic">
              This event ended on {new Date(event.startDate).toLocaleDateString()}.
            </p>
          )}
          {event.createdBy?.userInfo?.name && (
            <div className="flex items-center gap-3">
              <img
                src={
                  event.createdBy.userInfo.profileImage
                    ? `${import.meta.env.VITE_API_URL}/api/uploads/profileImages/${event.createdBy.userInfo.profileImage}`
                    : "/images/profile-pic.png"
                }
                alt="Host"
                className="w-10 h-10 rounded-full object-cover border"
              />
              <Link to={`/profile/${event.createdBy._id}`} className="text-indigo-500 hover:underline">
                Hosted by: {event.createdBy.userInfo.name}
              </Link>
            </div>
          )}
          {/* Like Button */}
          {!isPast && (
            <Button
              onClick={handleToggleLike}
              className="bg-red-500 text-white hover:bg-red-600 px-3 sm:px-4 py-2 rounded-lg transition duration-200"
              aria-label={isLiked ? "Unlike this event" : "Like this event"}
            >
              {isLiked ? "Unlike" : "Like"} ({likesCount})
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          className="text-red-500 hover:text-red-600"
          onClick={() => {
            setReportData({ type: "event", id: event._id });
            setReportModalOpen(true);
          }}
        >
          🚩 Report Event
        </Button>

        {/* Photo Gallery */}
        {(event.photos ?? []).length > 0 && (
          <div className="relative">
            <button
              onClick={() => galleryRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
              aria-label="Previous photos"
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow z-10"
            >
              ◀
            </button>
            <div ref={galleryRef} className="flex space-x-4 overflow-x-auto py-2">
              {event.photos!.map((file, idx) => (
                <img
                  key={idx}
                  src={resolvePhoto(file)}
                  alt={`Photo ${idx + 1}`}
                  className="w-64 h-40 object-cover rounded-lg"
                  loading="lazy"
                  onError={e => {
                    (e.currentTarget as HTMLImageElement).src = '/default-photo.png';
                  }}
                />
              ))}
            </div>
            <button
              onClick={() => galleryRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
              aria-label="Next photos"
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow z-10"
            >
              ▶
            </button>
          </div>
        )}

        {/* Event Memories Gallery for Past Events */}
        {isPast && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Event Memories</h2>
            {user && (
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept="image/*,video/*"
                  ref={fileInputRef}
                  onChange={handleUploadMedia}
                  className="p-2 border rounded-lg"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 px-3 sm:px-4 py-2 rounded-lg"
                >
                  Upload Media
                </Button>
              </div>
            )}
            {mediaUploadError && <p className="text-red-500 text-sm">{mediaUploadError}</p>}
            {media.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => mediaGalleryRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
                  aria-label="Previous media"
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-3 rounded-full shadow-lg z-10 hover:bg-gray-100 transition-all duration-200"
                >
                  ◀
                </button>
                <div ref={mediaGalleryRef} className="flex space-x-4 overflow-x-auto py-2">
                  {media.map((item) => (
                    <div key={item._id} className="relative flex-shrink-0 w-64 h-40">
                      {item.url.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video
                          src={resolvePhoto(item.url)}
                          controls
                          className="w-full h-full object-cover rounded-lg"
                          onError={e => {
                            (e.currentTarget as HTMLVideoElement).poster = '/default-photo.png';
                          }}
                        />
                      ) : (
                        <img
                          src={resolvePhoto(item.url)}
                          alt={`Media uploaded by ${item.uploadedBy.userInfo?.name || 'Anonymous'}`}
                          className="w-full h-full object-cover rounded-lg"
                          loading="lazy"
                          onError={e => {
                            (e.currentTarget as HTMLImageElement).src = '/default-photo.png';
                          }}
                        />
                      )}
                      <div className="absolute bottom-2 left-2 flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleMediaLike(item._id)}
                          className={`${item.isLiked ? 'bg-red-600' : 'bg-gray-200'
                            } text-white px-4 py-2 rounded-full font-semibold text-lg shadow-md hover:${item.isLiked ? 'bg-red-700' : 'bg-gray-300'
                            } transform hover:scale-105 transition-all duration-200`}
                        >
                          {item.isLiked ? 'Unlike' : 'Like'} ({item.likes.length})
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="bg-yellow-400 text-white px-4 py-2 rounded-full font-semibold text-lg shadow-md hover:bg-yellow-500 transform hover:scale-105 transition-all duration-200"
                          onClick={() => {
                            setReportData({ type: "media", id: item._id });
                            setReportModalOpen(true);
                          }}
                        >
                          🚩 Report
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Uploaded by {item.uploadedBy.userInfo?.name || 'Anonymous'} •{' '}
                        {format(new Date(item.createdAt), 'yyyy-MM-dd')}
                      </p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => mediaGalleryRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
                  aria-label="Next media"
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white p-3 rounded-full shadow-lg z-10 hover:bg-gray-100 transition-all duration-200"
                >
                  ▶
                </button>
              </div>
            )}            {media.length === 0 && (
              <p className="text-gray-500 text-center py-4">No media uploaded yet.</p>
            )}
          </div>
        )}

        {/* Reservation (RSVP) */}
        {!isPast && (
          <div className="space-y-3">
            <div className="flex items-center space-x-4 flex-wrap">
              {(["yes", "maybe", "no"] as const).map(choice => (
                <Button
                  key={choice}
                  onClick={() => handleMyRSVP(choice)}
                  variant={reservationState === choice ? "default" : "outline"}
                  className={`${reservationState === choice
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    } px-3 sm:px-4 py-2 rounded-lg transition duration-200`}
                >
                  {choice === "yes" ? "✅ Yes" : choice === "maybe" ? "🤔 Maybe" : "❌ No"}
                </Button>
              ))}
              {reservationState && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setReservationState(null);
                    setShowReservationMsg("RSVP cleared");
                    setTimeout(() => setShowReservationMsg(""), 3000);
                  }}
                  className="ml-2 bg-white border border-gray-300 text-gray-800 hover:bg-red-100"
                >
                  Clear RSVP
                </Button>
              )}
            </div>
            {showReservationMsg && <span className="text-green-600 font-medium">{showReservationMsg}</span>}
          </div>
        )}

        {/* Reservation Section */}
        <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg">
          {!isPast && reservation ? (
            <p className="text-green-500">
              You’ve reserved for {reservation.numberOfPeople} people (
              {reservation.status})
            </p>
          ) : !isPast ? (
            <div className="flex items-center space-x-2">
              <label>Reserve for</label>
              <input
                type="number"
                min={1}
                value={partySize}
                onChange={e => setPartySize(+e.target.value)}
                className="w-16 p-1 border rounded"
              />
              <button
                onClick={handleReserve}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Reserve
              </button>
            </div>
          ) : (
            <p className="text-gray-500">Reservations are closed for this past event.</p>
          )}
        </div>

        {/* Guest summary stats */}
        {!isPast && (
          <div className="flex items-center space-x-4 mt-6 flex-wrap">
            {(["yes", "maybe", "no"] as const).map(status => {
              const emoji = status === "yes" ? "✅" : status === "maybe" ? "🤔" : "❌";
              const count = event.guests?.filter(g => g.rsvp === status).length || 0;
              const bg =
                status === "yes"
                  ? "bg-indigo-100 text-indigo-800"
                  : status === "maybe"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800";
              return (
                <button
                  key={status}
                  onClick={() => setShowGuestList(true)}
                  className={`${bg} px-3 py-1 rounded-full hover:opacity-90 transition flex items-center space-x-1`}
                >
                  <span>{emoji}</span>
                  <span>{count}</span>
                </button>
              );
            })}
            <button
              onClick={() => setShowGuestList(true)}
              className="ml-4 text-indigo-600 underline hover:text-indigo-800"
            >
              View all guests
            </button>
          </div>
        )}

        {/* Map */}
        <div className="w-full h-64 rounded-lg overflow-hidden">
          <iframe
            title="Event Location"
            src={`https://www.google.com/maps?q=${encodeURIComponent(event.location)}&output=embed`}
            className="w-full h-full border-0"
            loading="lazy"
          />
        </div>

        {/* Comments */}
        {!isPast && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Comments</h2>
            <ul className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2 bg-gray-50">
              {comments.length === 0 ? (
                <li className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</li>
              ) : (
                comments.map(c => (
                  <li key={c._id} className="border-b pb-2 last:border-b-0 last:pb-0">
                    <p className="text-sm text-gray-500">
                      {c.author.userInfo?.name || c.author.email} •{" "}
                      {c.createdAt && !isNaN(new Date(c.createdAt).getTime())
                        ? format(new Date(c.createdAt), "yyyy-MM-dd HH:mm:ss")
                        : "Unknown date"}
                    </p>
                    <p className="text-gray-900 dark:text-white">{c.message}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-red-400 hover:text-red-600 dark:text-red-300 dark:hover:text-red-500"
                      onClick={() => {
                        setReportData({ type: "comment", id: c._id });
                        setReportModalOpen(true);
                      }}
                    >
                      Report
                    </Button>
                  </li>
                ))
              )}
              <div ref={commentEndRef} />
            </ul>
            {commentError && <p className="text-red-500 text-sm">{commentError}</p>}
            <div className="flex space-x-2">
              <input
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleAddComment()}
                placeholder="Add a comment…"
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              />
              <Button
                onClick={handleAddComment}
                className="bg-indigo-600 text-white hover:bg-indigo-700 px-3 sm:px-4 py-2 rounded-lg transition duration-200"
              >
                Submit
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={copyLink}
            className="bg-blue-500 text-white hover:bg-blue-600 px-3 sm:px-4 py-2 rounded-lg transition duration-200"
          >
            Copy Link
          </Button>
          {copyError && <p className="text-red-500 text-sm">{copyError}</p>}
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(
              `Check out this event: ${event.title}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 sm:px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition duration-200 no-underline"
          >
            Share on Twitter
          </a>
        </div>
      </div>

      {/* Feedback section for past events */}
      {isPast && id && (
        <div className="max-w-4xl mx-auto py-6 px-4">
          <FeedbackSection eventId={id} />
        </div>
      )}

      {/* Modal Overlay for Guest List */}
      {showGuestList && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-6 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={() => setShowGuestList(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-full overflow-auto mt-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">Guest List</h2>
              <button
                onClick={() => setShowGuestList(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold w-8 h-8 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-6">
              {(["yes", "maybe", "no"] as const).map(status => {
                const label = status === "yes" ? "Going" : status === "maybe" ? "Maybe" : "Not going";
                const emoji = status === "yes" ? "✅" : status === "maybe" ? "🤔" : "❌";
                const list = event.guests?.filter(g => g.rsvp === status) || [];
                if (!list.length) return null;
                return (
                  <div key={status}>
                    <h3 className="font-medium mb-2">
                      {emoji} {label} ({list.length})
                    </h3>
                    <ul className="space-y-2">
                      {list.map(g => (
                        <li key={g.user._id} className="flex items-center space-x-3">
                          <img
                            src={
                              g.user.userInfo?.profileImage
                                ? `${import.meta.env.VITE_API_URL}/Uploads/profileImages/${g.user.userInfo.profileImage}`
                                : "/images/profile-pic.png"
                            }
                            alt={g.user.userInfo?.name || g.user.email}
                            className="w-8 h-8 rounded-full object-cover border"
                          />
                          <span className="text-gray-800 dark:text-gray-200">
                            {g.user.userInfo?.name || "Anonymous"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
              {!event.guests || event.guests.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No guests have RSVP'd yet.</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportData && (
        <ReportModal
          open={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          targetId={reportData.id}
          type={reportData.type}
        />
      )}
    </>
  );
};

export default EventDetails;