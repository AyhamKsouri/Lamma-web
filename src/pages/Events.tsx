import { FC, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../services/eventService';

interface EventData {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  bannerUrl: string;
  category:
    | 'clubbing'
    | 'rave'
    | 'birthday'
    | 'wedding'
    | 'food'
    | 'sport'
    | 'meeting'
    | 'conference'
    | 'other';
}

const categories = [
  'All',
  'Clubbing',
  'Rave',
  'Birthday',
  'Wedding',
  'Food',
  'Sport',
  'Meeting',
  'Conference',
  'Other',
];

const Events: FC = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    setLoading(true);
    getEvents()
      .then((data) => {
        const mapped = data.map((ev) => ({
          id:            ev._id,
          title:         ev.title,
          startDate:     ev.startDate,
          endDate:       ev.endDate,
          startTime:     ev.startTime,
          endTime:       ev.endTime,
          location:      ev.location,
          bannerUrl:     ev.photos?.[0] || '',  // or however you pick a banner
          category:      ev.type,
        }));
        setEvents(mapped);
      })
      .catch((err) => setError(err.message || 'Error loading events'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = events
    .filter((ev) => selectedCategory === 'All' || ev.category === selectedCategory.toLowerCase())
    .filter((ev) => ev.title.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div className="p-6 text-center">Loading events…</div>;
  if (error)   return <div className="p-6 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-6 py-6 animate-fade-in">
      <h2 className="text-2xl font-semibold">All Events</h2>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Search events..."
          className="form-input flex-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="form-input w-auto"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-500">No events found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((ev) => (
            <Link key={ev.id} to={`/events/${ev.id}`} className="block">
              <div className="form-card hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                <img
                  src={ev.bannerUrl}
                  alt={ev.title}
                  className="w-full h-40 object-cover rounded-t-lg"
                  loading="lazy"
                />
                <div className="p-4">
                  <h3 className="text-lg font-medium mb-1">{ev.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(ev.startDate).toLocaleDateString()} • {ev.startTime}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Ends: {new Date(ev.endDate).toLocaleDateString()} • {ev.endTime}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{ev.location}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
