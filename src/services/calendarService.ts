// src/services/calendarService.ts

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
   * Fetch events for a specific month (1st to last day of month)
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
      visibility: 'public',  // ✅ Make sure to match backend filters
    };

    return await getEvents(page, limit, filters);
  }

  /**
   * Group events by each date they span across
   */
  public groupEventsByDate(events: EventData[]): Record<string, EventData[]> {
    const map: Record<string, EventData[]> = {};

    events.forEach((event) => {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().split('T')[0];
        if (!map[key]) map[key] = [];
        map[key].push(event);
      }
    });

    return map;
  }

  /**
   * Get all events for a specific date
   */
  public getEventsForDate(events: EventData[], date: Date): EventData[] {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter((event) => {
      return dateStr >= event.startDate && dateStr <= event.endDate;
    });
  }

  /**
   * Return true if there are any events on a specific date
   */
  public hasEvents(events: EventData[], date: Date): boolean {
    return this.getEventsForDate(events, date).length > 0;
  }

  /**
   * Return upcoming events only
   */
  public getUpcomingEvents(events: EventData[]): EventData[] {
    const now = new Date();
    return events.filter((event) => new Date(event.startDate) >= now);
  }
}

export const calendarService = CalendarService.getInstance();
