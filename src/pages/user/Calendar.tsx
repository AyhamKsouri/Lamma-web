import React, { FC, useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getEvents, EventData, PaginationData, EventFilters } from '@/services/eventService';
import { useToast } from '@/components/ui/use-toast';
import '@/styles/calendar.css';

const DEFAULT_EVENT_BANNER = '/default-event-banner.jpg';
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const Calendar: FC = () => {
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [state, setState] = useState<CalendarState>({
    events: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      hasNextPage: false,
      limit: 100
    },
    loading: false,
    error: null,
  });


  const formatDateToString = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const formatTime = (time: string): string => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    return new Date(2000, 0, 1, +hours, +minutes)
      .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const eventsByDate = useMemo(() => {
    const map: Record<string, EventData[]> = {};
    state.events.forEach(event => {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);

      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dateKey = formatDateToString(date);
        if (!map[dateKey]) {
          map[dateKey] = [];
        }
        map[dateKey].push(event);
      }
    });
    return map;
  }, [state.events]);

  const fetchEvents = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const filters: EventFilters = {
        startDate: formatDateToString(startDate),
        endDate: formatDateToString(endDate),
      };

      const { events, pagination } = await getEvents(1, state.pagination.limit, filters);
      setState(s => ({ ...s, events, pagination, loading: false }));
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to load events';
      setState(s => ({ ...s, loading: false, error: msg }));
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  }, [currentMonth, state.pagination.limit, toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const hasEventsOnDate = useCallback((date: Date): boolean => {
    const dateKey = formatDateToString(date);
    return (eventsByDate[dateKey]?.length || 0) > 0;
  }, [eventsByDate]);

  const isSameDay = (a: Date, b: Date): boolean => {
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  };

  const isTodayDate = useCallback((date: Date): boolean => {
    return isSameDay(date, new Date());
  }, []);

  const isSelectedDate = useCallback((date: Date): boolean => {
    return selectedDate ? isSameDay(date, selectedDate) : false;
  }, [selectedDate]);

  const formatEventDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const onDayClick = useCallback((date: Date) => {
    setSelectedDate(date);
    const dateKey = formatDateToString(date);
    const events = eventsByDate[dateKey] || [];
    setSelectedEvent(events.length === 1 ? events[0] : null);
  }, [eventsByDate]);

  const navigate = useCallback((offset: number) => {
    setCurrentMonth(current => {
      const newDate = new Date(current);
      newDate.setMonth(current.getMonth() + offset);
      return newDate;
    });
    setSelectedDate(null);
    setSelectedEvent(null);
  }, []);

  const goToday = useCallback(() => {
    setCurrentMonth(new Date());
    setSelectedDate(null);
    setSelectedEvent(null);
  }, []);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

    return Array.from({ length: totalCells }, (_, i) => {
      const day = i - firstDay + 1;
      return day >= 1 && day <= daysInMonth ? new Date(year, month, day) : null;
    });
  }, [currentMonth]);

  if (state.error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <h2 className="text-xl font-semibold">Error loading calendar</h2>
        <p className="text-muted-foreground">{state.error}</p>
        <Button onClick={fetchEvents}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="calendar-container">
      <header className="calendar-header">
        <h1 className="calendar-title">Event Calendar</h1>
        <p className="calendar-subtitle">Manage and view your upcoming events</p>
      </header>

      <div className="calendar-layout">
        <section className="calendar-main">
          <div className="calendar-controls">
            <div className="calendar-controls-left">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button className="calendar-nav-btn" onClick={() => navigate(-12)}>
                      <ChevronLeft /><ChevronLeft className="-ml-2" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Previous Year</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button className="calendar-nav-btn" onClick={() => navigate(-1)}>
                      <ChevronLeft />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Previous Month</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <h2 className="calendar-current-month">
              <CalendarIcon className="inline-block mr-2" />
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>

            <div className="calendar-controls-right">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button className="calendar-nav-btn" onClick={() => navigate(1)}>
                      <ChevronRight />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Next Month</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button className="calendar-nav-btn" onClick={() => navigate(12)}>
                      <ChevronRight /><ChevronRight className="-ml-2" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Next Year</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button className="calendar-today-btn" onClick={goToday}>Today</Button>
            </div>
          </div>

          <div className="calendar-grid-container">
            <div className="calendar-weekdays">
              {WEEKDAYS.map(day => (
                <div key={day} className="calendar-weekday">{day}</div>
              ))}
            </div>

            <div className="calendar-days-grid">
              {calendarDays.map((date, index) => (
                <div
                  key={index}
                  className={`calendar-cell${!date ? ' calendar-cell-inactive' : ''}`}
                >
                  {date && (
                    <button
                      onClick={() => onDayClick(date)}
                      className={`calendar-day${isTodayDate(date) ? ' calendar-day-today' : ''
                        }${isSelectedDate(date) ? ' calendar-day-selected' : ''
                        }${hasEventsOnDate(date) ? ' calendar-day-has-events' : ''
                        }`}
                      title={`${formatEventDate(date)}${hasEventsOnDate(date) ? ' - Has Events' : ''
                        }`}
                    >
                      <span className="calendar-day-number">{date.getDate()}</span>
                      {hasEventsOnDate(date) && (
                        <div className="calendar-day-events">
                          <span className="calendar-day-event-indicator" />
                        </div>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="calendar-side-panel">
          <Card className="calendar-events-card">
            <CardContent className="p-0">
              <div className="calendar-events-header">
                <h3 className="calendar-events-title">
                  {selectedDate
                    ? `Events for ${formatEventDate(selectedDate)}`
                    : 'Select a date to view events'}
                </h3>
              </div>
              <div className="calendar-events-list">
                {selectedDate && eventsByDate[formatDateToString(selectedDate)]?.length === 0 && (
                  <div className="calendar-no-events">
                    <p>No events scheduled for this day</p>
                    <Link to="/new-event" className="calendar-add-event-link">
                      + Add New Event
                    </Link>
                  </div>
                )}
                {selectedDate && eventsByDate[formatDateToString(selectedDate)]?.length > 0 && (
                  <div className="calendar-events-grid">
                    {eventsByDate[formatDateToString(selectedDate)].map(event => (
                      <div
                        key={event.id}
                        className="calendar-event-card-container"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <Card className={`calendar-event-card${selectedEvent?.id === event.id ? ' calendar-event-card-selected' : ''
                          }`}>
                          <div className="relative w-full h-32 overflow-hidden rounded-t-lg">
                            <img
                              src={event.bannerUrl || '/default-event-banner.jpg'}
                              alt={event.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = '/default-event-banner.jpg';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                          </div>
                          <CardContent className="p-4">
                            <div className="flex flex-col space-y-3">
                              <h4 className="text-xl font-semibold text-white">{event.title}</h4>
                              <div className="flex items-center text-gray-400">
                                <Clock className="w-4 h-4 mr-2" />
                                <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                              </div>
                              <div className="flex items-center text-gray-400">
                                <MapPin className="w-4 h-4 mr-2" />
                                <span>{event.location}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                )}
                {!selectedDate && (
                  <div className="calendar-select-date">
                    <CalendarIcon className="calendar-icon-large" />
                    <p>Select a date to view events</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {selectedEvent && (
            <Card className="calendar-event-full-details">
              <h3 className="calendar-event-detail-title">
                {selectedEvent.title}
              </h3>
              <p className="calendar-event-detail-datetime">
                <CalendarIcon className="inline-block mr-1 opacity-70" />
                {formatEventDate(new Date(selectedEvent.startDate))} at{' '}
                {formatTime(selectedEvent.startTime)}
              </p>
              <p className="calendar-event-detail-location">
                <MapPin className="inline-block mr-1 opacity-70" />
                {selectedEvent.location}
              </p>
              {selectedEvent.description && (
                <p className="calendar-event-detail-description">
                  {selectedEvent.description}
                </p>
              )}
            </Card>
          )}

          <div className="calendar-actions">
            <Link to="/events" className="calendar-view-all-link">
              View All Events
            </Link>
            <Link to="/new-event" className="calendar-add-event-btn">
              Add New Event
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Calendar;