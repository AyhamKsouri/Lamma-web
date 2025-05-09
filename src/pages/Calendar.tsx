import React, { FC, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import "../styles/calendar.css";

// Sample event data with images
interface EventData {
  id: number;
  title: string;
  date: Date;
  location: string;
  description: string;
  bannerUrl: string;
}

const sampleEvents: EventData[] = [
  { id: 1, title: 'Dance Night', date: new Date(2025, 3, 15, 21), location: 'Club Groove', description: 'All-night dance party with top DJs.', bannerUrl: '/images/event1_banner.jpg' },
  { id: 2, title: 'Guitar Lesson', date: new Date(2025, 3, 18, 17), location: 'Music Hall', description: 'Beginner guitar workshop.', bannerUrl: '/images/event2_banner.jpg' },
  { id: 3, title: 'Food Festival', date: new Date(2025, 3, 20, 12), location: 'Central Park', description: 'Taste cuisines from around the world.', bannerUrl: '/images/event3_banner.jpg' },
];

const CalendarPage: FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [direction, setDirection] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);

  // Group events by date string
  const eventsByDate = useMemo(() => {
    const map: Record<string, EventData[]> = {};
    sampleEvents.forEach(ev => {
      const key = ev.date.toDateString();
      map[key] = map[key] || [];
      map[key].push(ev);
    });
    return map;
  }, []);

  // Month navigation with direction
  const changeMonth = (offset: number) => {
    setDirection(offset);
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };
  const prevYear = () => changeMonth(-12);
  const prevMonth = () => changeMonth(-1);
  const nextMonth = () => changeMonth(1);
  const nextYear = () => changeMonth(12);
  const goToToday = () => { setDirection(0); setCurrentMonth(new Date()); };

  // Calendar grid
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);
  const startDay = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();
  const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;
  const cells = Array.from({ length: totalCells }).map((_, idx) => {
    const day = idx - startDay + 1;
    return day >= 1 && day <= daysInMonth ? new Date(year, month, day) : null;
  });

  // Handle date click
  const onDayClick = (date: Date) => {
    setSelectedDate(date);
    const evs = eventsByDate[date.toDateString()] || [];
    setSelectedEvent(evs.length === 1 ? evs[0] : null);
  };
  const sideEvents = selectedDate ? eventsByDate[selectedDate.toDateString()] || [] : [];

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  // Check if date is selected
  const isSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString();
  };

  // Check if date has events
  const hasEvents = (date: Date) => {
    return eventsByDate[date.toDateString()]?.length > 0;
  };

  // Format date for event display
  const formatEventDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric'
    });
  };

  // Format time for event display
  const formatEventTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1 className="calendar-title">Event Calendar</h1>
        <p className="calendar-subtitle">Manage and view your upcoming events</p>
      </div>

      <div className="calendar-layout">
        {/* Calendar Panel */}
        <div className="calendar-main">
          <div className="calendar-controls">
            <div className="calendar-controls-left">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={prevYear} 
                      className="calendar-nav-btn"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <ChevronLeft className="h-4 w-4 -ml-2" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Previous Year</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={prevMonth} 
                      className="calendar-nav-btn"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Previous Month</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <h2 className="calendar-current-month">
              <CalendarIcon className="h-5 w-5 inline-block mr-2" />
              {currentMonth.toLocaleString('default', {month: 'long'})} {year}
            </h2>
            
            <div className="calendar-controls-right">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={nextMonth} 
                      className="calendar-nav-btn"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Next Month</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={nextYear} 
                      className="calendar-nav-btn"
                    >
                      <ChevronRight className="h-4 w-4" />
                      <ChevronRight className="h-4 w-4 -ml-2" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Next Year</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Button onClick={goToToday} className="calendar-today-btn">
                Today
              </Button>
            </div>
          </div>

          <div className="calendar-grid-container">
            <div className="calendar-weekdays">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="calendar-weekday">{day}</div>
              ))}
            </div>
            
            <div className="calendar-days-grid">
              {cells.map((date, idx) => (
                <div 
                  key={idx} 
                  className={`calendar-cell ${!date ? 'calendar-cell-inactive' : ''}`}
                >
                  {date && (
                    <button
                      onClick={() => onDayClick(date)}
                      title={hasEvents(date) ? `${eventsByDate[date.toDateString()].length} events` : 'No events'}
                      className={`calendar-day ${isToday(date) ? 'calendar-day-today' : ''} ${isSelected(date) ? 'calendar-day-selected' : ''} ${hasEvents(date) ? 'calendar-day-has-events' : ''}`}
                    >
                      <span className="calendar-day-number">{date.getDate()}</span>
                      
                      {hasEvents(date) && (
                        <div className="calendar-day-events">
                          {eventsByDate[date.toDateString()].slice(0, 2).map((event, i) => (
                            <div key={i} className="calendar-day-event-indicator" title={event.title}></div>
                          ))}
                          {eventsByDate[date.toDateString()].length > 2 && (
                            <span className="calendar-day-more-events">+{eventsByDate[date.toDateString()].length - 2}</span>
                          )}
                        </div>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="calendar-side-panel">
          <Card className="calendar-events-card">
            <CardContent className="p-0">
              <div className="calendar-events-header">
                <h3 className="calendar-events-title">
                  {selectedDate ? (
                    <>Events for {formatEventDate(selectedDate)}</>
                  ) : (
                    <>Select a date to view events</>
                  )}
                </h3>
              </div>
              
              <div className="calendar-events-list">
                {selectedDate ? (
                  sideEvents.length === 0 ? (
                    <div className="calendar-no-events">
                      <p>No events scheduled for this day</p>
                      <Link to="/new-event" className="calendar-add-event-link">+ Add New Event</Link>
                    </div>
                  ) : (
                    <div className="calendar-events-grid">
                      {sideEvents.map(event => (
                        <div 
                          key={event.id} 
                          className="calendar-event-card-container"
                          onClick={() => setSelectedEvent(event)}
                        >
                          <Card className={`calendar-event-card ${selectedEvent?.id === event.id ? 'calendar-event-card-selected' : ''}`}>
                            <div className="calendar-event-image">
                              <img 
                                src={event.bannerUrl} 
                                alt={event.title} 
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Event+Image';
                                }}
                              />
                            </div>
                            <CardContent>
                              <h4 className="calendar-event-title">{event.title}</h4>
                              <p className="calendar-event-time">
                                <Clock className="h-3.5 w-3.5 inline-block mr-1 opacity-70" />
                                {formatEventTime(event.date)}
                              </p>
                              <p className="calendar-event-location">
                                <MapPin className="h-3.5 w-3.5 inline-block mr-1 opacity-70" />
                                {event.location}
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="calendar-select-date">
                    <CalendarIcon className="h-16 w-16 calendar-icon-large" />
                    <p>Select a date to view events</p>
                  </div>
                )}
              </div>
              
              {selectedEvent && (
                <div className="calendar-event-details">
                  <Card>
                    <CardContent className="calendar-event-full-details">
                      <h3 className="calendar-event-detail-title">{selectedEvent.title}</h3>
                      <p className="calendar-event-detail-datetime">
                        <CalendarIcon className="h-4 w-4 inline-block mr-1 opacity-70" />
                        {formatEventDate(selectedEvent.date)} at {formatEventTime(selectedEvent.date)}
                      </p>
                      <p className="calendar-event-detail-location">
                        <MapPin className="h-4 w-4 inline-block mr-1 opacity-70" />
                        {selectedEvent.location}
                      </p>
                      <p className="calendar-event-detail-description">{selectedEvent.description}</p>
                      <Button asChild className="calendar-view-details-btn">
                        <Link to={`/events/${selectedEvent.id}`}>View Full Details</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="calendar-actions">
            <Link to="/events" className="calendar-view-all-link">View All Events</Link>
            <Button asChild className="calendar-add-event-btn">
              <Link to="/new-event">Add New Event</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;