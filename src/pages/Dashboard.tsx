import { FC, useState } from 'react';
import { Link } from 'react-router-dom';

// Define categories, including an 'All' option
const categories = ['All', 'Clubbing', 'Rave', 'Birthday', 'Wedding', 'Food', 'Sport', 'Meeting', 'Conference', 'Other'];

// Sample events now include a category field
const trendingEvents = [
  { id: 1, title: 'Dance Night', date: 'May 3, 2025', category: 'Clubbing' },
  { id: 2, title: 'Food Festival', date: 'May 5, 2025', category: 'Food' },
  { id: 3, title: 'Marathon', date: 'May 10, 2025', category: 'Sport' },
];
const recommendedEvents = [
  { id: 4, title: 'Tech Conference', date: 'May 15, 2025', category: 'Conference' },
  { id: 5, title: 'Art Expo', date: 'May 20, 2025', category: 'Other' },
  { id: 6, title: 'Live Concert', date: 'May 25, 2025', category: 'Rave' },
];
const upcomingNearYou = [
  { id: 7, title: 'Local Meetup', date: 'May 2, 2025', category: 'Meeting' },
  { id: 8, title: 'Neighborhood Cleanup', date: 'May 8, 2025', category: 'Other' },
];
const recentlyViewed = [
  { id: 9, title: 'Yoga Class', date: 'April 30, 2025', category: 'Sport' },
  { id: 10, title: 'Photography Workshop', date: 'April 28, 2025', category: 'Other' },
];

const Dashboard: FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Generic filter helper
  const filterEvents = <T extends { title: string; category: string }>(events: T[]) =>
    events
      .filter(ev => selectedCategory === 'All' || ev.category === selectedCategory)
      .filter(ev => ev.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const filteredTrending = filterEvents(trendingEvents);
  const filteredRecommended = filterEvents(recommendedEvents);
  const filteredNearby = filterEvents(upcomingNearYou);
  const filteredViewed = filterEvents(recentlyViewed);

  return (
    <div className="space-y-12 px-6 py-6 animate-fade-in">
      {/* Hero Banner */}
      <section className="relative h-64 sm:h-80 lg:h-96 rounded-lg overflow-hidden group">
        <img
          src="/images/eventweek.png"
          alt="Event of the Week"
          className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-4">
          <h2 className="text-3xl sm:text-4xl font-bold drop-shadow-lg">Event of the Week</h2>
          <p className="mt-2 text-sm sm:text-base drop-shadow-md">Join us for a night to remember!</p>
          <Link
            to="/events/1"
            className="mt-4 inline-block form-submit transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section>
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Search events..."
            className="form-input flex-1"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select
            className="form-input w-auto"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </section>

      {/* Category Chips */}
      <section className="overflow-x-auto py-2">
        <div className="flex space-x-4 px-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors duration-200
                ${selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Trending Events */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Trending Events</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrending.map(ev => (
            <Link key={ev.id} to={`/events/${ev.id}`} className="block">
              <div className="form-card hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                <h4 className="font-medium text-lg">{ev.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{ev.date}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recommended for You */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Recommended for You</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecommended.map(ev => (
            <Link key={ev.id} to={`/events/${ev.id}`} className="block">
              <div className="form-card hover:shadow-lg hover:scale-105 transition-transform duration-200">
                <h4 className="font-medium text-lg">{ev.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{ev.date}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Upcoming Near You */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Upcoming Events Near You</h3>
        <div className="space-y-3">
          {filteredNearby.map(ev => (
            <Link key={ev.id} to={`/events/${ev.id}`} className="block">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{ev.title}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{ev.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recently Viewed */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Recently Viewed</h3>
        <div className="flex space-x-4 overflow-x-auto py-2">
          {filteredViewed.map(ev => (
            <Link key={ev.id} to={`/events/${ev.id}`} className="block min-w-[200px]">
              <div className="form-card hover:shadow-lg transition-shadow duration-200">
                <h4 className="font-medium text-lg">{ev.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{ev.date}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="text-center">
  <Link
    to="/new-event"
    className="form-submit inline-block transform hover:scale-105 hover:shadow-lg transition-all duration-300"
  >
    Create Your Own Event
  </Link>
</section>

    </div>
  );
};

export default Dashboard;
