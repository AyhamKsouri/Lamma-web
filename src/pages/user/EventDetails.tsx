import React, { FC, useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/services/api";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";


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
  const [reservationState, setReservationState] = useState<string | null>(null); // Track reservation status
  const [showReservationMsg, setShowReservationMsg] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState("");
  const [copyError, setCopyError] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const commentEndRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) {
      setError("No event ID provided.");
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      api.get<EventData>(`/api/event/${id}`), // Ensure this matches the route
      api.get<Comment[]>(`/api/comments/${id}`),
    ])
      .then(([eventRes, commentsRes]) => {
        setEvent(eventRes.data || null);
        setComments(commentsRes.data || []);
        setLikesCount(eventRes.data?.likesCount || 0);
        const currentUserId = localStorage.getItem("userId");
        if (currentUserId && eventRes.data?.likes) {
          setIsLiked(eventRes.data.likes.some((like: string) => like.toString() === currentUserId));
        }
        const userReservation = eventRes.data?.guests?.find((g: Guest) => g.user._id === currentUserId);
        setReservationState(userReservation ? "yes" : null);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load event or comments.");
      })
      .finally(() => setLoading(false));
  }, [id]);
  useEffect(() => {
    commentEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleReservation = async (choice: "yes" | "no" | "maybe", numberOfPeople = 1) => {
    if (!id) return;
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName") || "Anonymous";
    if (!userId) {
      setError("User not authenticated.");
      return;
    }

    try {
      const reservations = await api.get(`/api/reservation/${id}`);
      const userReservation = reservations.data.find((r) => r.user.toString() === userId);

      if (choice === "no" && userReservation) {
        await api.delete(`/api/reservation/${userReservation._id}`);
        setReservationState(null);
        setShowReservationMsg("Reservation canceled.");
      } else if (choice === "yes" && (!userReservation || userReservation.status !== "confirmed")) {
        await api.post(`/api/reservation/${id}`, { numberOfPeople, userName });
        setReservationState("yes");
        setShowReservationMsg(`Reservation made for ${numberOfPeople} people.`);
      } else if (choice === "maybe" && (!userReservation || userReservation.status === "pending")) {
        await api.post(`/api/reservation/${id}`, { numberOfPeople: 0, userName, status: "pending" });
        setReservationState("maybe");
        setShowReservationMsg("Reservation set as pending.");
      }
      setTimeout(() => setShowReservationMsg(""), 3000);
    } catch (err) {
      console.error("Failed to make reservation:", err);
      setError("Failed to make reservation.");
    }
  };

  const handleToggleLike = async () =>   {
    if (!id) return;
    try {
      const response = await api.post(`/api/event/${id}/like`);
      // Update both the like status and count from the response
      setIsLiked(!isLiked); // Toggle the current state
      setLikesCount(response.data.likes?.length || 0); // Use the length of likes array
    } catch (err) {
      console.error("Failed to toggle like:", err);
      setError("Failed to toggle like.");
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
        eventId: id
      });

      const newComment: Comment = {
        _id: response.data._id,
        author: {
          _id: user._id,
          email: user.email || "anonymous@example.com",
          userInfo: {
            name: user.userInfo?.name || user.name || user.email || "Anonymous",
            profileImage: user.userInfo?.profileImage || user.profileImage || ""
          }
        },
        message: commentText.trim(),
        createdAt: now, // ✅ force using current local ISO timestamp
        likes: []
      };

      setComments(prevComments => [newComment, ...prevComments]);
      setCommentText("");
      setCommentError("");

    } catch (err: any) {
      console.error("Comment error details:", {
        status: err.response?.status,
        data: err.response?.data,
        error: err.message
      });

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
    return (
      <div className="p-6">
        <p>Loading event…</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="p-6">
        <p className="text-red-500">{error || "Event not found."}</p>
        <Link to="/" className="text-indigo-600 hover:underline">
          ← Back to Home
        </Link>
      </div>
    );
  }

  const displayDate = `${new Date(event.startDate).toLocaleDateString()} • ${event.startTime}`;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6 animate-fade-in">
      <Link to="/" className="text-indigo-600 hover:underline">
        ← Back to Home
      </Link>

      {/* Banner */}
      <div className="rounded-lg overflow-hidden shadow-lg">
        <img
          src={event.bannerUrl}
          alt={event.title}
          className="w-full h-64 object-cover"
          loading="lazy"
        />
      </div>

      {/* Title & Info */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{event.title}</h1>
        <p className="text-gray-600">{displayDate}</p>
        <p className="text-gray-600 truncate">{event.location}</p>
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
              Hosted by: {event.createdBy.userInfo?.name || "Unknown"}
            </Link>
          </div>
        )}
        <Button
          onClick={handleToggleLike}
          className="bg-red-500 text-white hover:bg-red-600 px-3 sm:px-4 py-2 rounded-lg transition duration-200"
          aria-label={isLiked ? "Unlike this event" : "Like this event"}
        >
          {isLiked ? "Unlike" : "Like"} ({likesCount})
        </Button>
      </div>

      {/* Photo Gallery */}
      {event.photos && event.photos.length > 0 && (
        <div className="relative">
          <button
            onClick={() => galleryRef.current?.scrollBy({ left: -300, behavior: "smooth" })}
            aria-label="Previous photos"
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow"
          >
            ◀
          </button>
          <div
            ref={galleryRef}
            className="flex space-x-4 overflow-x-auto snap-x snap-mandatory scroll-smooth py-2"
          >
            {event.photos.map((src, idx) => (
              <img
                key={idx}
                src={src}
                className="w-64 h-40 object-cover rounded-lg snap-center"
                loading="lazy"
                alt={`Photo ${idx + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => galleryRef.current?.scrollBy({ left: 300, behavior: "smooth" })}
            aria-label="Next photos"
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow"
          >
            ▶
          </button>
        </div>
      )}

      {/* Reservation (RSVP) */}
      <div className="flex items-center space-x-4">
        {(["yes", "maybe", "no"] as const).map((choice) => (
          <Button
            key={choice}
            onClick={() => handleReservation(choice, choice === "yes" ? 1 : 0)} // 1 for "yes", 0 for others
            variant={reservationState === choice ? "default" : "outline"}
            className={`${reservationState === choice
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              } px-3 sm:px-4 py-2 rounded-lg transition duration-200`}
          >
            {choice.charAt(0).toUpperCase() + choice.slice(1)}
          </Button>
        ))}
        {showReservationMsg && <span className="text-green-600">{showReservationMsg}</span>}
      </div>

      {/* Guests */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Guests</h2>
        <div className="flex -space-x-2">
          {event.guests?.slice(0, 5).map((g) => (
            <div
              key={g.user._id}
              className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center border-2 border-white"
              title={`${g.user.userInfo?.name || g.user.email} • RSVP: ${g.rsvp}`}
            >
              {(g.user.userInfo?.name || g.user.email).charAt(0)}
            </div>
          ))}
          {event.guests && event.guests.length > 5 && (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm border-2 border-white">
              +{event.guests.length - 5}
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="w-full h-64 rounded-lg overflow-hidden">
        <iframe
          title="Event Location"
          src={`https://www.google.com/maps?q=${encodeURIComponent(event.location)}&output=embed`}
          className="w-full h-full"
          loading="lazy"
        />
      </div>

      {/* Comments */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Comments</h2>
        <ul className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2 bg-gray-50">
          {comments.map((c) => (
            <li key={c._id} className="border-b pb-2 last:pb-0">
              <p className="text-sm text-gray-500">
                {c.author.userInfo?.name || c.author.email} •{' '}
                {c.createdAt && !isNaN(new Date(c.createdAt).getTime())
                  ? format(new Date(c.createdAt), 'yyyy-MM-dd HH:mm:ss')
                  : 'Unknown date'}


              </p>
              <p className="text-gray-900">{c.message}</p>
            </li>
          ))}
          <div ref={commentEndRef} />
        </ul>
        {commentError && <p className="text-red-500 text-sm">{commentError}</p>}
        <div className="flex space-x-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment…"
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900" // Added text-gray-900
          />
          <Button
            onClick={handleAddComment}
            className="bg-indigo-600 text-white hover:bg-indigo-700 px-3 sm:px-4 py-2 rounded-lg transition duration-200"
          >
            Submit
          </Button>
        </div>
      </div>

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
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
            window.location.href
          )}&text=${encodeURIComponent(event.title)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 sm:px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition duration-200"
        >
          Share on Twitter
        </a>
      </div>
    </div>
  );
};

export default EventDetails;