
import React, { FC, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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

// Animation variants for month transitions
const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

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

  // Key for AnimatePresence
  const monthKey = `${year}-${month}`;

  return (
    <div className="flex h-full animate-fade-in">
      {/* Calendar Panel */}
      <div className="w-2/3 border-r border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <button onClick={prevYear} className="calendar-nav-btn" aria-label="Prev year">«</button>
            <button onClick={prevMonth} className="calendar-nav-btn" aria-label="Prev month">‹</button>
          </div>
          <h2 className="text-xl font-semibold">{currentMonth.toLocaleString('default',{month:'long'})} {year}</h2>
          <div className="flex space-x-2">
            <button onClick={nextMonth} className="calendar-nav-btn" aria-label="Next month">›</button>
            <button onClick={nextYear} className="calendar-nav-btn" aria-label="Next year">»</button>
          </div>
          <button onClick={goToToday} className="today-btn">Today</button>
        </div>

        {/* Animated Month Grid */}
        <AnimatePresence custom={direction} initial={false} mode="wait">
          <motion.div
            key={monthKey}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4 }}
            className="space-y-2"
          >
            <div className="grid grid-cols-7 text-center font-medium">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {cells.map((date, idx) => {
                const keyStr = date?.toDateString() || '';
                const evs = date && eventsByDate[keyStr] ? eventsByDate[keyStr] : [];
                const selected = selectedDate?.toDateString() === keyStr;
                return (
                  <div key={idx} className="h-20">
                    {date && (
                      <div className="relative group">
                        <button
                          onClick={() => onDayClick(date)}
                          className={`calendar-day-btn ${selected ? 'calendar-day-selected' : ''}`}
                        >{date.getDate()}</button>
                        {evs.length > 0 && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                            {evs.slice(0,3).map((_, i) => <span key={i} className="event-dot" />)}
                            {evs.length > 3 && <span className="text-xs text-indigo-600 font-semibold">+{evs.length-3}</span>}
                          </div>
                        )}
                        {evs.length > 0 && (
                          <div className="calendar-tooltip">
                            {evs.map((ev, i) => <div key={i}>{ev.title}</div>)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Side Panel */}
      <div className="w-1/3 p-6 overflow-y-auto space-y-6">
        {!selectedDate ? (
          <p className="text-gray-500">Select a date to see events</p>
        ) : (
          <>
            <h3 className="text-lg font-semibold">{selectedDate.toDateString()}</h3>
            {sideEvents.length === 0 ? <p>No events on this day.</p> : sideEvents.map(ev => (
              <div key={ev.id} className="calendar-event-card transform hover:scale-105 hover:shadow-2xl transition-all duration-300" onClick={() => setSelectedEvent(ev)}>
                <img src={ev.bannerUrl} alt={ev.title} className="w-full h-32 object-cover rounded-t-lg mb-4" loading="lazy" />
                <h4 className="font-medium mb-1">{ev.title}</h4>
                <p className="text-sm text-gray-500 mb-2">{ev.location}, {ev.date.toLocaleTimeString()}</p>
              </div>
            ))}
            {selectedEvent && (
              <div className="calendar-event-card">
                <h2 className="text-xl font-bold mb-2">{selectedEvent.title}</h2>
                <p className="mb-2 text-gray-600">{selectedEvent.location}</p>
                <p className="text-gray-700 dark:text-gray-300 mb-4">{selectedEvent.description}</p>
                <Link to={`/events/${selectedEvent.id}`} className="text-indigo-600 hover:underline focus:outline-none focus:ring">View Full Details</Link>
              </div>
            )}
          </>
        )}
        <div className="mt-6 text-center">
          <Link to="/events" className="text-indigo-600 hover:underline focus:outline-none focus:ring">View All Events</Link>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
