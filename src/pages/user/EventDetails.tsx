// src/pages/EventDetails.tsx

import React, { FC, useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEventById, EventData } from '@/services/eventService';

// Types for guests/comments unchanged
interface Guest {
  id: number;
  name: string;
  avatarUrl?: string;
  rsvp: 'yes' | 'no' | 'maybe';
}
interface Comment {
  id: number;
  author: string;
  message: string;
  date: string;
}

const EventDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [rsvpState, setRsvpState] = useState<'yes'|'no'|'maybe' | null>(null);
  const [showRsvpMsg, setShowRsvpMsg] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState('');
  const [copyError, setCopyError] = useState('');
  const commentEndRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Fetch the event on mount / when `id` changes
  useEffect(() => {
    if (!id) {
      setError('No event ID provided.');
      setLoading(false);
      return;
    }
    setLoading(true);
    getEventById(id)
      .then(ev => {
        setEvent(ev);
        // initialize comments from ev.photos or empty
        setComments(ev.photos ? [] : []);
      })
      .catch(err => {
        console.error(err);
        setError('Event not found.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Scroll to latest comment
  useEffect(() => {
    commentEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

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
        <p className="text-red-500">{error || 'Event not found.'}</p>
        <Link to="/" className="text-indigo-600 hover:underline">
          ← Back to Home
        </Link>
      </div>
    );
  }

  // Helper to format display date/time (you can adjust)
  const displayDate = `${new Date(event.startDate).toLocaleDateString()} • ${event.startTime}`;

  const handleRsvp = (choice: 'yes'|'no'|'maybe') => {
    setRsvpState(choice);
    setShowRsvpMsg(`You responded '${choice}'`);
    setTimeout(() => setShowRsvpMsg(''), 3000);
  };
  const handleAddComment = () => {
    if (!commentText.trim()) {
      setCommentError('Comment cannot be empty');
      return;
    }
    const newComment: Comment = {
      id: Date.now(),
      author: 'You',
      message: commentText.trim(),
      date: new Date().toLocaleDateString(),
    };
    setComments([newComment, ...comments]);
    setCommentText('');
    setCommentError('');
  };
  const generateICS = () => {
    /* …your existing ICS code… */
  };
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyError('');
      alert('Link copied to clipboard!');
    } catch {
      setCopyError('Failed to copy link');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6 animate-fade-in">
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
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">{event.title}</h1>
        <p className="text-gray-600">{displayDate}</p>
        <p className="text-gray-600 truncate">{event.location}</p>
      </div>

      {/* Photo Gallery */}
      {event.photos && event.photos.length > 0 && (
        <div className="relative">
          <button
            onClick={() => galleryRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
            aria-label="Previous photos"
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow"
          >◀</button>
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
                alt={`Photo ${idx+1}`}
              />
            ))}
          </div>
          <button
            onClick={() => galleryRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
            aria-label="Next photos"
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow"
          >▶</button>
        </div>
      )}

      {/* RSVP */}
      <div className="flex items-center space-x-4">
        {(['yes','maybe','no'] as const).map(choice => (
          <button
            key={choice}
            onClick={() => handleRsvp(choice)}
            aria-pressed={rsvpState === choice}
            className={`px-4 py-2 rounded focus:outline-none focus:ring
              ${rsvpState === choice ? 'bg-indigo-600 text-white' : 'bg-gray-200'}
            `}
          >
            {choice.charAt(0).toUpperCase() + choice.slice(1)}
          </button>
        ))}
        {showRsvpMsg && <span className="text-green-600">{showRsvpMsg}</span>}
      </div>

      {/* Guests */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Guests</h2>
        <div className="flex -space-x-2">
          {event.guests?.slice(0,5).map(g => (
            <div
              key={g.id}
              className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center border-2 border-white"
              title={`${g.name} • RSVP: ${g.rsvp}`}
            >
              {g.name.charAt(0)}
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
        <ul className="space-y-2 max-h-60 overflow-y-auto" role="log" aria-live="polite">
          {comments.map(c => (
            <li key={c.id} className="border-b pb-2 last:pb-0">
              <p className="text-sm text-gray-500">{c.author} • {c.date}</p>
              <p>{c.message}</p>
            </li>
          ))}
          <div ref={commentEndRef} />
        </ul>
        {commentError && <p className="text-red-500 text-sm">{commentError}</p>}
        <div className="flex space-x-2">
          <input
            type="text"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Add a comment…"
            className="form-input flex-1"
          />
          <button
            onClick={handleAddComment}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={generateICS}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Add to Calendar
        </button>
        <button
          onClick={copyLink}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Copy Link
        </button>
        {copyError && <p className="text-red-500 text-sm">{copyError}</p>}
        <a
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(event.title)}`}
          target="_blank" rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-400 text-white rounded"
        >
          Share on Twitter
        </a>
      </div>
    </div>
  );
};

export default EventDetails;
