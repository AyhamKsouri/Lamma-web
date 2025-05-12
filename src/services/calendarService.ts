import { EventData, PaginationData, EventFilters, getEvents } from './eventService';

export class CalendarService {
  private static instance: CalendarService;

  private constructor() {}

  public static getInstance(): CalendarService {
    if (!CalendarService.instance) {
      CalendarService.instance = new CalendarService();
    }
    return CalendarService.instance;
  }

  /**
   * Fetch events for a specific month
   */
  public async getMonthEvents(
    date: Date,
    page: number = 1,
    limit: number = 100
  ): Promise<{ events: EventData[]; pagination: PaginationData }> {
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0];

    const filters: EventFilters = {
      startDate,
      endDate,
    };

    return getEvents(page, limit, filters);
  }

  /**
   * Group events by date for calendar display
   */
  public groupEventsByDate(events: EventData[]): Record<string, EventData[]> {
    const eventMap: Record<string, EventData[]> = {};
    
    events.forEach(event => {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      
      for (
        let date = new Date(start);
        date <= end;
        date.setDate(date.getDate() + 1)
      ) {
        const dateKey = date.toISOString().split('T')[0];
        if (!eventMap[dateKey]) {
          eventMap[dateKey] = [];
        }
        eventMap[dateKey].push(event);
      }
    });

    return eventMap;
  }

  /**
   * Get events for a specific date
   */
  public getEventsForDate(
    events: EventData[],
    date: Date
  ): EventData[] {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const startDate = event.startDate;
      const endDate = event.endDate;
      return dateStr >= startDate && dateStr <= endDate;
    });
  }

  /**
   * Check if a date has any events
   */
  public hasEvents(
    events: EventData[],
    date: Date
  ): boolean {
    return this.getEventsForDate(events, date).length > 0;
  }

  /**
   * Get upcoming events
   */
  public getUpcomingEvents(events: EventData[]): EventData[] {
    const now = new Date();
    return events.filter(event => new Date(event.startDate) >= now);
  }
}

export const calendarService = CalendarService.getInstance();