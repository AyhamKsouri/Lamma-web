// src/pages/Events.tsx

import React, { FC, useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Filter } from 'lucide-react';
import { getEvents, EventData, EventFilters } from '@/services/eventService';
import { useAuth } from '@/context/AuthContext';
import { AuthError } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import api from '@/services/api';
import UserCard from '@/components/user/userCard';
import '@/styles/event.css';

const DEFAULT_BANNER = '/default-event-banner.jpg';
const ITEMS_PER_PAGE = 10;
const SEARCH_DELAY = 500;

const categories = [
  'All', 'Clubbing', 'Rave', 'Birthday', 'Wedding', 'Food',
  'Sport', 'Meeting', 'Conference', 'Other', 'Users',
] as const;
type Category = typeof categories[number];

interface UserResult {
  _id: string;
  email: string;
  userInfo?: {
    name?: string;
    profileImage?: string;
  };
}

interface EventsState {
  events: EventData[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  selectedCategory: Category;
  currentPage: number;
  itemsPerPage: number;
  pagination: {
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
  } | null;
  userResults: UserResult[];
}

const initialState: EventsState = {
  events: [],
  loading: true,
  error: null,
  searchTerm: '',
  selectedCategory: 'All',
  currentPage: 1,
  itemsPerPage: ITEMS_PER_PAGE,
  pagination: null,
  userResults: [],
};

const Events: FC = () => {
  const [state, setState] = useState<EventsState>(initialState);
  const navigate = useNavigate();
  const { user, isChecking } = useAuth();
  const { toast } = useToast();
  const debouncedSearchTerm = useDebounce(state.searchTerm, SEARCH_DELAY);

  const handleAuthError = useCallback(() => {
    toast({
      variant: 'destructive',
      title: 'Session Expired',
      description: 'Please login again.',
    });
    setTimeout(() => navigate('/login'), 3000);
  }, [navigate, toast]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/api/user-account/all', {
        params: { search: debouncedSearchTerm }
      });
      setState(prev => ({ ...prev, userResults: res.data }));
    } catch (err) {
      console.error("Failed to fetch users", err);
      setState(prev => ({ ...prev, userResults: [], error: 'Failed to load users' }));
    }
  }, [debouncedSearchTerm]);


  const fetchEvents = useCallback(async () => {
    try {
      const filters: EventFilters = {
        visibility: 'public', // 🔒 Force public visibility for all roles
      };

      if (state.selectedCategory !== 'All' && state.selectedCategory !== 'Users') {
        filters.category = state.selectedCategory.toLowerCase();
      }
      if (debouncedSearchTerm) {
        filters.searchTerm = debouncedSearchTerm;
      }



      const response = await getEvents(state.currentPage, state.itemsPerPage, filters);

      console.log('📦 Received events:', response.events);
      console.log('📄 Pagination Info:', response.pagination);

      setState(prev => ({
        ...prev,
        events: response.events,
        pagination: {
          totalCount: response.pagination.totalCount,
          totalPages: response.pagination.totalPages,
          hasNextPage: response.pagination.hasNextPage,
        },
        loading: false,
      }));
    } catch (err) {
      if (err instanceof AuthError) handleAuthError();
      else {
        console.error('❌ Event Fetch Error:', err);
        setState(prev => ({ ...prev, error: 'Failed to load events', loading: false }));
      }
    }
  }, [
    state.selectedCategory,
    debouncedSearchTerm,
    state.currentPage,
    state.itemsPerPage,
    handleAuthError
  ]);

  useEffect(() => {
    if (!user || isChecking) return;
    if (state.selectedCategory === 'Users') fetchUsers();
    else fetchEvents();
  }, [user, isChecking, fetchEvents, fetchUsers, state.selectedCategory, state.currentPage, debouncedSearchTerm]);


  const handleCategoryChange = (cat: Category) => {
    setState(prev => ({ ...prev, selectedCategory: cat, currentPage: 1 }));
  };

  const handlePageClick = (page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  };

  const generatePageButtons = () => {
    const pages: (number | string)[] = [];
    const total = state.pagination?.totalPages || 1;
    const current = state.currentPage;

    if (current > 2) {
      pages.push(1);
      if (current > 3) pages.push('...');
    }

    for (let i = current - 1; i <= current + 1; i++) {
      if (i > 1 && i < total) pages.push(i);
    }

    if (current < total - 2) pages.push('...');
    if (total > 1) pages.push(total);

    console.log('🔢 Generated Page Buttons:', pages);
    return pages;
  };

  return (
    <div className="events-container">
      <div className="events-hero">
        <div className="events-hero-content">
          <h1 className="events-hero-title">Discover Amazing Events</h1>
          <Input
            type="text"
            placeholder="Search events or users..."
            value={state.searchTerm}
            onChange={e =>
              setState(prev => ({
                ...prev,
                searchTerm: e.target.value,
                currentPage: 1, // reset on search
              }))
            }
            className="w-full mt-4 text-black bg-white dark:text-white dark:bg-gray-800"
          />

        </div>
      </div>

      <div className="events-content">
        <aside className="events-filters">
          <h2 className="filters-title"><Filter className="filter-icon" /> Filter by Category</h2>
          <div className="category-buttons">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={state.selectedCategory === cat ? 'default' : 'outline'}
                onClick={() => handleCategoryChange(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </aside>

        {state.selectedCategory === 'Users' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
            {state.userResults.map(u => (
              <UserCard key={u._id} user={u} />
            ))}
          </div>
        ) : (
          <>
            <div className="events-grid mt-6">
              {state.events.map(e => (
                <Link key={e.id} to={`/events/${e.id}`} className="event-card-link">
                  <Card className="event-card">
                    <img src={e.bannerUrl || DEFAULT_BANNER} alt={e.title} className="h-[200px] w-full object-cover" />
                    <CardContent className="event-content">
                      <h3 className="event-title">{e.title}</h3>
                      <div className="event-details">
                        <span>{new Date(e.startDate).toLocaleDateString()}</span>
                        <span>{e.location}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Numbered Pagination */}
            {state.pagination && state.pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8 space-x-2">
                <Button
                  variant="outline"
                  disabled={state.currentPage === 1}
                  onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                >
                  Previous
                </Button>
                {generatePageButtons().map((p, idx) =>
                  typeof p === 'string' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 py-1 text-white">...</span>
                  ) : (
                    <Button
                      key={`page-${p}`}
                      variant={state.currentPage === p ? 'default' : 'outline'}
                      onClick={() => handlePageClick(p)}
                    >
                      {p}
                    </Button>
                  )
                )}

                <Button
                  variant="outline"
                  disabled={!state.pagination.hasNextPage}
                  onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Events;
