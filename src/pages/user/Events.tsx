// src/pages/Events.tsx
import React, { FC, useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, Clock, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getEvents, EventData, EventFilters } from '@/services/eventService';
import { useAuth } from '@/context/AuthContext';
import { AuthError } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from '@/hooks/useDebounce';
import '@/styles/event.css';

const DEFAULT_BANNER = '/default-event-banner.jpg';
const ITEMS_PER_PAGE = 10;
const SEARCH_DELAY = 500; // ms

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
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  onPageChange: (page: number | string) => void;
  totalItems: number;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
}

const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalPages,
  hasNextPage,
  onPageChange,
  totalItems,
  itemsPerPage,
  onItemsPerPageChange
}) => {
  const getPageNumbers = () => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | '...')[] = [];
    let last: number | null = null;

    range.push(1);
    for (let i = currentPage - delta; i <= currentPage + delta; i++) {
      if (i > 1 && i < totalPages) {
        range.push(i);
      }
    }
    if (totalPages > 1) range.push(totalPages);

    for (const page of range) {
      if (last !== null) {
        if (page === last + 2) {
          rangeWithDots.push(last + 1);
        } else if (page > last + 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(page);
      last = page;
    }

    return rangeWithDots;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 bg-background border-t border-border">
      <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
        Showing <span className="font-medium">{startItem}</span> to{' '}
        <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => onItemsPerPageChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={itemsPerPage.toString()} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map(size => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center">
            {getPageNumbers().map((page, idx) =>
              page === '...' ? (
                <span key={`dot-${idx}`} className="px-2 text-muted-foreground">…</span>
              ) : (
                <Button
                  key={idx}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => onPageChange(page)}
                  className={`h-8 w-8 ${
                    currentPage === page
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'hover:bg-accent'
                  }`}
                >
                  {page}
                </Button>
              )
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNextPage}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
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
      description: 'Your session has expired. Please sign in again.',
      action: (
        <button
          onClick={() => navigate('/login')}
          className="px-3 py-2 text-sm font-medium text-white bg-destructive-foreground hover:bg-destructive-foreground/90 rounded-md"
        >
          Sign In
        </button>
      ),
    });
    setTimeout(() => navigate('/login'), 5000);
  }, [navigate, toast]);

  const fetchEvents = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const filters: EventFilters = {};
      if (state.selectedCategory !== 'All') {
        filters.category = state.selectedCategory.toLowerCase();
      }
      if (debouncedSearchTerm) {
        filters.searchTerm = debouncedSearchTerm;
      }
      const response = await getEvents(state.currentPage, state.itemsPerPage, filters);
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
      if (err instanceof AuthError) {
        handleAuthError();
      } else {
        const message = err instanceof Error ? err.message : 'Failed to load events.';
        setState(prev => ({ ...prev, error: message, loading: false }));
        toast({ variant: 'destructive', title: 'Error', description: message });
      }
    }
  }, [
    state.currentPage,
    state.itemsPerPage,
    state.selectedCategory,
    debouncedSearchTerm,
    handleAuthError,
    toast,
  ]);

  useEffect(() => {
    if (!isChecking) {
      if (!user) {
        navigate('/login');
      } else {
        fetchEvents();
      }
    }
  }, [isChecking, user, fetchEvents, navigate]);

  // --- FIXED: handlePageChange now accepts string|number and normalizes to number ---
  const handlePageChange = (newPage: number | string) => {
    const pageNum = typeof newPage === 'string' ? parseInt(newPage, 10) : newPage;
    if (isNaN(pageNum) || pageNum < 1 || (state.pagination && pageNum > state.pagination.totalPages)) {
      return;
    }
    setState(prev => ({ ...prev, currentPage: pageNum }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setState(prev => ({
      ...prev,
      itemsPerPage: newItemsPerPage,
      currentPage: 1,
    }));
  };

  useEffect(() => {
    setState(prev => ({ ...prev, currentPage: 1 }));
  }, [state.selectedCategory, debouncedSearchTerm]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

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

  return (
    <div className="events-container">
      {/* Hero & Search */}
      <div className="events-hero">
        <div className="events-hero-content">
          <h1 className="events-hero-title">Discover Amazing Events</h1>
          <p className="events-hero-subtitle">
            Find and join exciting events happening near you
          </p>
          <div className="events-search">
            <div className="search-wrapper">
              <Search className="search-icon" />
              <Input
                type="text"
                placeholder="Search events by name..."
                value={state.searchTerm}
                onChange={e => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="search-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters + Grid */}
      <div className="events-content">
        <aside className="events-filters">
          <h2 className="filters-title">
            <Filter className="filter-icon" /> Filter by Category
          </h2>
          <div className="category-buttons">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={state.selectedCategory === cat ? 'default' : 'outline'}
                onClick={() => setState(prev => ({ ...prev, selectedCategory: cat }))}
                className={state.selectedCategory === cat ? 'category-active' : ''}
              >
                {cat}
              </Button>
            ))}
          </div>
        </aside>

        {state.loading ? (
          <div className="events-grid">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="event-card is-loading">
                <div className="event-banner">
                  <Skeleton className="h-[200px] w-full" />
                </div>
                <CardContent className="event-content">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : state.error ? (
          <div className="events-error">
            <h3>Oops! Something went wrong</h3>
            <p>{state.error}</p>
            <Button onClick={() => fetchEvents()}>Try Again</Button>
          </div>
        ) : state.events.length === 0 ? (
          <div className="events-empty">
            <h3>No events found</h3>
            <p>Try adjusting your search or filters</p>
            {state.selectedCategory !== 'All' && (
              <Button onClick={() => setState(prev => ({ ...prev, selectedCategory: 'All' }))}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="events-grid">
              {state.events.map(event => (
                <Link key={event.id} to={`/events/${event.id}`} className="event-card-link">
                  <Card className="event-card">
                    <div className="event-banner">
                      <img
                        src={event.bannerUrl || DEFAULT_BANNER}
                        alt={event.title}
                        loading="lazy"
                        onError={e => {
                          const img = e.target as HTMLImageElement;
                          img.src = DEFAULT_BANNER;
                        }}
                        className="w-full h-[200px] object-cover"
                      />
                      <Badge className="event-date-badge">{formatDate(event.startDate)}</Badge>
                      <Badge className="event-category-badge">{event.category}</Badge>
                    </div>
                    <CardContent className="event-content">
                      <h3 className="event-title">{event.title}</h3>
                      <div className="event-details">
                        <div className="event-detail">
                          <Clock className="event-icon" />
                          <span>{event.startTime}</span>
                        </div>
                        <div className="event-detail">
                          <MapPin className="event-icon" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* PAGINATION */}
            {state.events.length > 0 && state.pagination && (
              <Pagination
                currentPage={state.currentPage}
                totalPages={state.pagination.totalPages}
                hasNextPage={state.pagination.hasNextPage}
                onPageChange={handlePageChange}
                totalItems={state.pagination.totalCount}
                itemsPerPage={state.itemsPerPage}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Events;
