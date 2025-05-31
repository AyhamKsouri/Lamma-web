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
import { calendarService } from '@/services/calendarService';
import { EventData, PaginationData } from '@/services/eventService';
import { useToast } from '@/components/ui/use-toast';
import '@/styles/calendar.css';

const DEFAULT_EVENT_BANNER = '/default-event-banner.jpg';
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface CalendarState {
  events: EventData[];
  pagination: PaginationData;
  loading: boolean;
  error: string | null;
}

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

  const formatDateToString = (date: Date): string =>
    date.toISOString().split('T')[0];

  const formatTime = (time: string): string => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    return new Date(2000, 0, 1, +hours, +minutes).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const eventsByDate = useMemo(() =>
    calendarService.groupEventsByDate(state.events),
    [state.events]
  );

  const fetchEvents = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const { events, pagination } = await calendarService.getMonthEvents(currentMonth, 1, state.pagination.limit);
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

  const isSameDay = (a: Date, b: Date): boolean =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const isTodayDate = useCallback((date: Date) =>
    isSameDay(date, new Date()), []);

  const isSelectedDate = useCallback((date: Date) =>
    selectedDate ? isSameDay(date, selectedDate) : false, [selectedDate]);

  const hasEventsOnDate = useCallback((date: Date) =>
    calendarService.hasEvents(state.events, date), [state.events]);

  const onDayClick = useCallback((date: Date) => {
    setSelectedDate(date);
    const matched = calendarService.getEventsForDate(state.events, date);
    setSelectedEvent(matched.length === 1 ? matched[0] : null);
  }, [state.events]);

  const formatEventDate = (date: Date): string =>
    date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });

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
          {/* Controls */}
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

          {/* Grid */}
          <div className="calendar-grid-container">
            <div className="calendar-weekdays">
              {WEEKDAYS.map(day => (
                <div key={day} className="calendar-weekday">{day}</div>
              ))}
            </div>
            <div className="calendar-days-grid">
              {calendarDays.map((date, index) => (
                <div key={index} className={`calendar-cell${!date ? ' calendar-cell-inactive' : ''}`}>
                  {date && (
                    <button
                      onClick={() => onDayClick(date)}
                      className={`calendar-day${isTodayDate(date) ? ' calendar-day-today' : ''}${isSelectedDate(date) ? ' calendar-day-selected' : ''}${hasEventsOnDate(date) ? ' calendar-day-has-events' : ''}`}
                      title={formatEventDate(date)}
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

        <aside className="calendar-side-panel flex flex-col">
          <Card className="calendar-events-card flex-1 overflow-hidden">
            <CardContent className="p-0 flex flex-col h-full">
              <div className="calendar-events-header px-4 py-2 border-b">
                <h3 className="calendar-events-title">
                  {selectedDate
                    ? `Events for ${formatEventDate(selectedDate)}`
                    : 'Select a date to view events'}
                </h3>
              </div>

              <div className="calendar-events-list flex-1 overflow-y-auto p-2">
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
                        <Card className={`calendar-event-card${selectedEvent?.id === event.id ? ' calendar-event-card-selected' : ''}`}>
                          <div className="relative w-full h-32 overflow-hidden rounded-t-lg">
                            <img
                              src={event.bannerUrl || DEFAULT_EVENT_BANNER}
                              alt={event.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = DEFAULT_EVENT_BANNER;
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                          </div>
                          <CardContent className="p-4">
                            <h4 className="text-xl font-semibold text-white">{event.title}</h4>
                            <div className="flex items-center text-gray-400">
                              <Clock className="w-4 h-4 mr-2" />
                              <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                            </div>
                            <div className="flex items-center text-gray-400">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span>{event.location}</span>
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

              {/* Selected event details outside scrollable list */}
              {selectedEvent && (
                <Card className="calendar-event-full-details mt-2 mx-2">
                  <CardContent className="p-4 space-y-3">
                    <h3 className="text-lg font-semibold">{selectedEvent.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      <CalendarIcon className="inline w-4 h-4 mr-1" />
                      {formatEventDate(new Date(selectedEvent.startDate))} at {formatTime(selectedEvent.startTime)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <MapPin className="inline w-4 h-4 mr-1" />
                      {selectedEvent.location}
                    </p>
                    {selectedEvent.description && (
                      <p className="text-sm leading-relaxed">{selectedEvent.description}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Buttons */}
              <div className="calendar-actions mt-4 p-4">
                <Link to="/events" className="calendar-view-all-link">View All Events</Link>
                <Link to="/new-event" className="calendar-add-event-btn ml-4">Add New Event</Link>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default Calendar;
