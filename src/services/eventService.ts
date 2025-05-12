import api, { AuthError } from './api';
import { AxiosError } from 'axios';

export interface EventData {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  bannerUrl: string;
  visibility: 'public' | 'private';
  category:
    | 'clubbing'
    | 'rave'
    | 'birthday'
    | 'wedding'
    | 'food'
    | 'sport'
    | 'meeting'
    | 'conference'
    | 'other';
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  limit: number;
}

export interface PaginatedResponse {
  events: RawEvent[];
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
}

export interface EventFilters {
  category?: string;
  searchTerm?: string;
  visibility?: 'public' | 'private';
}

interface RawEvent {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  photos?: string[];
  type: string;
  visibility: 'public' | 'private';
  price: number;
}

export interface CreateEventData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  type: EventData['category'];
  visibility: 'public' | 'private';
  price: number;
  photos?: File[];
}

export async function getEvents(
  page: number = 1,
  limit: number = 10,
  filters: EventFilters = {}
): Promise<{ events: EventData[]; pagination: PaginationData }> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.category && filters.category !== 'all' && { type: filters.category }),
      ...(filters.searchTerm && { search: filters.searchTerm })
    });

    console.log('Request URL:', `/api/event?${params}`);
    console.log('Request params:', Object.fromEntries(params));

    const resp = await api.get<PaginatedResponse>(`/api/event?${params}`);
    
    console.log('Raw API response:', resp.data);

    if (!resp.data || !Array.isArray(resp.data.events)) {
      console.error('Unexpected response structure:', resp.data);
      throw new Error('Invalid response format from server');
    }

    const events = resp.data.events.map((ev) => ({
      id: ev._id,
      title: ev.title,
      startDate: ev.startDate,
      endDate: ev.endDate,
      startTime: ev.startTime,
      endTime: ev.endTime,
      location: ev.location,
      bannerUrl: ev.photos?.[0] || '',
      category: ev.type as EventData['category'],
      visibility: ev.visibility,
    }));

    const pagination: PaginationData = {
      currentPage: Number(resp.data.page) || page,
      totalPages: Math.max(1, Number(resp.data.totalPages) || Math.ceil(events.length / limit)),
      totalCount: Number(resp.data.totalCount) || events.length,
      hasNextPage: Boolean(resp.data.hasNextPage),
      limit: Number(resp.data.limit) || limit
    };

    console.log('Processed response:', { events, pagination });

    return { events, pagination };
  } catch (error: unknown) {
    console.error('Events API Error:', error);
    
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        throw new AuthError('Session expired');
      }
      throw new Error(error.response?.data?.message || 'Failed to load events');
    }
    throw new Error('An unexpected error occurred');
  }
}

export async function createEvent(eventData: CreateEventData): Promise<EventData> {
  try {
    const formData = new FormData();
    Object.entries(eventData).forEach(([key, value]) => {
      if (key !== 'photos') {
        formData.append(key, String(value));
      }
    });

    if (eventData.photos?.length) {
      eventData.photos.forEach(photo => {
        formData.append('photos', photo);
      });
    }

    const resp = await api.post<{success: boolean; data: RawEvent}>('/api/event', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!resp.data?.data) {
      throw new Error('Invalid response format from server');
    }

    const event = resp.data.data;
    return {
      id: event._id,
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      bannerUrl: event.photos?.[0] || '',
      category: event.type as EventData['category'],
      visibility: event.visibility,
    };
  } catch (error: unknown) {
    console.error('Create Event Error:', error);
    
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        throw new AuthError('Session expired');
      }
      throw new Error(error.response?.data?.message || 'Failed to create event');
    }
    throw new Error('An unexpected error occurred');
  }
}