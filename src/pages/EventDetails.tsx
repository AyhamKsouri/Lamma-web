import React, { FC, useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

// Types
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
interface EventData {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
  bannerUrl: string;
  guests: Guest[];
  comments: Comment[];
  photos?: string[];
}

// Sample data
const sampleEvents: EventData[] = [
  {
    id: 1,
    title: 'Dance Night',
    date: 'May 3, 2025 • 9:00 PM',
    location: 'Club Groove, Downtown',
    description:
      'Join us for an electrifying night of dance and music featuring top DJs from around the world.',
    bannerUrl: '/images/event1_banner.jpg',
    photos: ['/images/event1_1.jpg', '/images/event1_2.jpg', '/images/event1_3.jpg'],
    guests: [
      { id: 1, name: 'Alice', rsvp: 'yes' },
      { id: 2, name: 'Bob', rsvp: 'maybe' },
      { id: 3, name: 'Carol', rsvp: 'yes' },
      { id: 4, name: 'Dave', rsvp: 'no' },
      { id: 5, name: 'Eve', rsvp: 'yes' },
      { id: 6, name: 'Frank', rsvp: 'yes' }
    ],
    comments: [
      { id: 1, author: 'Charlie', message: 'Can’t wait for this!', date: 'Apr 20, 2025' },
      { id: 2, author: 'Dana', message: 'Is there a dress code?', date: 'Apr 21, 2025' }
    ],
  },
];

const EventDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const event = sampleEvents.find((e) => e.id === Number(id));
  const [rsvpState, setRsvpState] = useState<'yes'|'no'|'maybe' | null>(null);
  const [showRsvpMsg, setShowRsvpMsg] = useState('');
  const [comments, setComments] = useState<Comment[]>(event?.comments || []);
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState('');
  const [copyError, setCopyError] = useState('');
  const commentEndRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Scroll to latest comment
  useEffect(() => {
    commentEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  if (!event) {
    return (
      <div className="p-6">
        <p className="text-red-500">Event not found.</p>
        <Link to="/" className="text-indigo-600 hover:underline focus:outline-none focus:ring">
          ← Back to Home
        </Link>
      </div>
    );
  }

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
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setComments([newComment, ...comments]);
    setCommentText('');
    setCommentError('');
  };

  // ICS generation
  const generateICS = () => {
    /* ...same as before... */
  };

  // Share link
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
      <Link to="/" className="text-indigo-600 hover:underline focus:outline-none focus:ring">
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
        <p className="text-gray-600 dark:text-gray-400">{event.date}</p>
        <p className="text-gray-600 dark:text-gray-400 truncate">{event.location}</p>
      </div>

      {/* Photo Gallery */}
      {event.photos && (
        <div className="relative">
          <button
            onClick={() => galleryRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
            aria-label="Previous photos"
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow focus:outline-none focus:ring"
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
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow focus:outline-none focus:ring"
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
              ${rsvpState === choice ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}
            `}
          >{choice.charAt(0).toUpperCase()+choice.slice(1)}</button>
        ))}
        {showRsvpMsg && (
          <span className="text-green-600 animate-fade-in">{showRsvpMsg}</span>
        )}
      </div>

      {/* Guest Avatars */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Guests ({event.guests.length})</h2>
        <div className="flex -space-x-2">
          {event.guests.slice(0,5).map(g => (
            <div
              key={g.id}
              className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center border-2 border-white"
              title={`${g.name} • RSVP: ${g.rsvp}`}
            >{g.name.charAt(0)}</div>
          ))}
          {event.guests.length > 5 && (
            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-sm border-2 border-white">
              +{event.guests.length - 5}
            </div>
          )}
        </div>
      </div>

      {/* Map Embed */}
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
              <p className="text-sm text-gray-500 dark:text-gray-400">{c.author} • {c.date}</p>
              <p>{c.message}</p>
            </li>
          ))}
          <div ref={commentEndRef} />
        </ul>
        {commentError && <p className="text-red-500 text-sm animate-fade-in">{commentError}</p>}
        <div className="flex space-x-2">
          <input
            type="text"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Add a comment…"
            className="form-input flex-1 focus:outline-none focus:ring"
            aria-label="New comment"
          />
          <button
            onClick={handleAddComment}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition focus:outline-none focus:ring"
          >Submit</button>
        </div>
      </div>

      {/* Actions: Calendar & Share */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={generateICS}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition focus:outline-none focus:ring"
        >Add to Calendar</button>
        <button
          onClick={copyLink}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition focus:outline-none focus:ring"
        >Copy Link</button>
        {copyError && <p className="text-red-500 text-sm animate-fade-in">{copyError}</p>}
        <a
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(event.title)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-400 text-white rounded hover:bg-blue-500 transition focus:outline-none focus:ring"
        >Share on Twitter</a>
      </div>
    </div>
  );
};

export default EventDetails;
