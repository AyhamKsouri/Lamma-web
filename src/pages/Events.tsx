import React, { FC, useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getEvents, EventData } from '@/services/eventService';
import { useAuth } from '@/context/AuthContext';
import { AuthError } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

// Define categories as const to ensure type safety
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
] as const;

type Category = typeof categories[number];
type FilteredCategory = Exclude<Category, 'All'>;

interface EventsState {
  events: EventData[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  selectedCategory: Category;
}

const initialState: EventsState = {
  events: [],
  loading: true,
  error: null,
  searchTerm: '',
  selectedCategory: 'All',
};

const Events: FC = () => {
  const [state, setState] = useState<EventsState>(initialState);
  const navigate = useNavigate();
  const { reloadUser, signOut, user, isChecking } = useAuth();
  const { toast } = useToast();

  // Check authentication status
  useEffect(() => {
    if (!isChecking && !user) {
      navigate('/login');
    }
  }, [user, isChecking, navigate]);

  const handleAuthError = useCallback(() => {
    toast({
      variant: "destructive",
      title: "Session Expired",
      description: "Your session has expired. Please sign in again.",
      action: (
        <button
          onClick={() => navigate('/login')}
          className="px-3 py-2 text-sm font-medium text-white bg-destructive-foreground hover:bg-destructive-foreground/90 rounded-md"
        >
          Sign In
        </button>
      ),
    });

    setTimeout(() => {
      signOut();
      navigate('/login');
    }, 5000);
  }, [signOut, navigate, toast]);

  const fetchEvents = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await getEvents();
      setState(prev => ({ ...prev, events: data, loading: false }));
    } catch (err) {
      if (err instanceof AuthError) {
        handleAuthError();
      } else {
        setState(prev => ({
          ...prev,
          error: 'Failed to load events. Please try again.',
          loading: false
        }));
        
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load events. Please try again.",
        });
      }
    }
  }, [handleAuthError, toast]);

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [fetchEvents, user]);

  const getFilteredEvents = useCallback(
    (events: EventData[], category: Category, searchTerm: string) => {
      return events
        .filter(ev => 
          category === 'All' || 
          ev.category.toLowerCase() === category.toLowerCase()
        )
        .filter(ev => 
          ev.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    },
    []
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, searchTerm: e.target.value }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setState(prev => ({ 
      ...prev, 
      selectedCategory: e.target.value as Category 
    }));
  };

  const handleRetry = () => {
    fetchEvents();
  };

  const handleSignOut = async () => {
    signOut();
    navigate('/login');
  };

  // If still checking auth status, show loading
  if (isChecking) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  const filteredEvents = getFilteredEvents(
    state.events,
    state.selectedCategory,
    state.searchTerm
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">All Events</h2>
        <div className="flex gap-4">
          <Link
            to="/new-event"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Create Event
          </Link>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Search events..."
          className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={state.searchTerm}
          onChange={handleSearch}
          aria-label="Search events"
        />
        <select
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={state.selectedCategory}
          onChange={handleCategoryChange}
          aria-label="Filter by category"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {state.loading ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
            <p className="text-gray-600">Loading events...</p>
          </div>
        </div>
      ) : state.error ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{state.error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No events found</p>
          {state.selectedCategory !== 'All' && (
            <button
              onClick={() => setState(prev => ({ ...prev, selectedCategory: 'All' }))}
              className="text-blue-600 hover:text-blue-700"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(ev => (
            <Link
              key={ev.id}
              to={`/events/${ev.id}`}
              className="group block border rounded-lg hover:shadow-lg transition-all duration-200 overflow-hidden bg-white"
            >
              {ev.bannerUrl ? (
                <img
                  src={ev.bannerUrl}
                  alt={ev.title}
                  className="w-full h-40 object-cover group-hover:opacity-90 transition-opacity"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-medium mb-1 group-hover:text-blue-600 transition-colors">
                  {ev.title}
                </h3>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">
                    {new Date(ev.startDate).toLocaleDateString()} • {ev.startTime}
                  </p>
                  <p className="text-sm text-gray-500">
                    Ends: {new Date(ev.endDate).toLocaleDateString()} • {ev.endTime}
                  </p>
                  <p className="text-sm text-gray-500">
                    {ev.location}
                  </p>
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