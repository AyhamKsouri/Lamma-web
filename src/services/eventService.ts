// src/services/eventService.ts

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
  description?: string;
  bannerUrl?: string;
  photos?: string[];
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
  createdBy?: {
    _id: string;
    email?: string;
    userInfo?: {
      name?: string;
      profileImage?: string;
    };
  };

  guests?: {
    user: {
      _id: string;
      name: string;
    };
    rsvp: 'yes' | 'no' | 'maybe';
  }[];
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
  startDate?: string;
  endDate?: string;
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
  createdBy?: {
    _id: string;
    email?: string;
    userInfo?: {
      name?: string;
      profileImage?: string;
    };
  };

  guests?: {
    user: {
      _id: string;
      name: string;
    };
    rsvp: 'yes' | 'no' | 'maybe';
  }[];
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

const API_BASE_URL = 'http://localhost:3000';

const isValidDate = (date: string): boolean =>
  !isNaN(Date.parse(date));
const isValidTime = (time: string): boolean => /^\d{2}:\d{2}(:\d{2})?$/.test(time);

function processPhotoUrl(url?: string): string {
  if (!url) return '/fallback-image.png';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const normalizedUrl = url.startsWith('/uploads/eventPhotos/')
    ? url
    : `/uploads/eventPhotos/${url.replace(/^\/+/, '')}`;

  return `${API_BASE_URL}${normalizedUrl}`;
}


export async function getEvents(
  page: number = 1,
  limit: number = 10,
  filters: EventFilters = {}
): Promise<{ events: EventData[]; pagination: PaginationData }> {

  const params: any = {
    page,
    limit,
  };
  console.log("➡ [Frontend] Fetching events with params:", params);


  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;
  if (filters.searchTerm) params.searchTerm = filters.searchTerm;
  if (filters.visibility) params.visibility = filters.visibility;
  if (filters.category && filters.category.toLowerCase() !== 'all') {
    params.type = filters.category.toLowerCase();
  }

  try {
    const resp = await api.get<PaginatedResponse>('/api/event', { params });
    if (!resp.data || !Array.isArray(resp.data.events)) {
      throw new Error('Invalid response format from server');
    }

    const events: EventData[] = resp.data.events.map(ev => ({
      id: ev._id,
      title: ev.title,
      startDate: isValidDate(ev.startDate) ? ev.startDate : '',
      endDate: isValidDate(ev.endDate) ? ev.endDate : '1970-01-01',
      startTime: isValidTime(ev.startTime) ? ev.startTime : '00:00',
      endTime: isValidTime(ev.endTime) ? ev.endTime : '00:00',
      location: ev.location,
      description: ev.description,
      bannerUrl: ev.photos && ev.photos.length > 0 ? processPhotoUrl(ev.photos[0]) : '',
      photos: ev.photos?.map(photo => processPhotoUrl(photo)) || [],
      category: ev.type as EventData['category'],
      visibility: ev.visibility,
      createdBy: ev.createdBy
        ? {
          _id: ev.createdBy._id,
          email: ev.createdBy.email,
          userInfo: ev.createdBy.userInfo
            ? {
              name: ev.createdBy.userInfo.name,
              profileImage: ev.createdBy.userInfo.profileImage
            }
            : undefined
        }
        : undefined


    }));

    const pagination: PaginationData = {
      currentPage: Number(resp.data.page) || page,
      totalPages: Math.max(1, Number(resp.data.totalPages) || Math.ceil(events.length / limit)),
      totalCount: Number(resp.data.totalCount) || events.length,
      hasNextPage: Boolean(resp.data.hasNextPage),
      limit: Number(resp.data.limit) || limit,
    };

    return { events, pagination };
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response) {
      if (error.response.status === 401) throw new AuthError('Session expired');
      throw new Error(error.response.data?.message || 'Failed to load events');
    }
    throw error instanceof Error ? error : new Error('An unexpected error occurred');
  }
}

export async function createEvent(eventData: CreateEventData): Promise<EventData> {
  const formData = new FormData();
  Object.entries(eventData).forEach(([key, value]) => {
    if (key !== 'photos') formData.append(key, String(value));
  });
  eventData.photos?.forEach(photo => formData.append('photos', photo));

  try {
    const resp = await api.post<{ success: boolean; data: RawEvent }>(
      '/api/event',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    if (!resp.data || typeof resp.data !== 'object' || !resp.data.success || !resp.data.data) {
      console.error('Unexpected response format:', resp.data);
      throw new Error('Invalid response format from server');
    } const ev = resp.data.data;

    return {
      id: ev._id,
      title: ev.title,
      startDate: isValidDate(ev.startDate) ? ev.startDate : '1970-01-01',
      endDate: isValidDate(ev.endDate) ? ev.endDate : '1970-01-01',
      startTime: isValidTime(ev.startTime) ? ev.startTime : '00:00',
      endTime: isValidTime(ev.endTime) ? ev.endTime : '00:00',
      location: ev.location,
      description: ev.description || '',
      bannerUrl: ev.photos && ev.photos.length > 0 ? processPhotoUrl(ev.photos[0]) : '',
      photos: ev.photos?.map(photo => processPhotoUrl(photo)) || [],
      category: ev.type as EventData['category'],
      visibility: ev.visibility,
      createdBy: ev.createdBy
        ? {
          _id: ev.createdBy._id,
          email: ev.createdBy.email,
          userInfo: ev.createdBy.userInfo
            ? {
              name: ev.createdBy.userInfo.name,
              profileImage: ev.createdBy.userInfo.profileImage
            }
            : undefined
        }
        : undefined

    };
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response) {
      if (error.response.status === 401) throw new AuthError('Session expired');
      throw new Error(error.response.data?.message || 'Failed to create event');
    }
    throw error instanceof Error ? error : new Error('An unexpected error occurred');
  }
}

export async function getMyEvents(): Promise<EventData[]> {
  try {
    const response = await api.get<RawEvent[]>('/api/event/user/me');
    if (!Array.isArray(response.data)) {
      throw new Error('Invalid response format from server');
    }

    return response.data.map(ev => ({
      id: ev._id,
      title: ev.title,
      startDate: isValidDate(ev.startDate) ? ev.startDate : '1970-01-01',
      endDate: isValidDate(ev.endDate) ? ev.endDate : '1970-01-01',
      startTime: isValidTime(ev.startTime) ? ev.startTime : '00:00',
      endTime: isValidTime(ev.endTime) ? ev.endTime : '00:00',
      location: ev.location,
      description: ev.description || '',
      bannerUrl: ev.photos && ev.photos.length > 0 ? processPhotoUrl(ev.photos[0]) : '',
      photos: ev.photos?.map(photo => processPhotoUrl(photo)) || [],
      category: ev.type as EventData['category'],
      visibility: ev.visibility,
      createdBy: ev.createdBy ? {
        _id: ev.createdBy._id,
        name: ev.createdBy.userInfo?.name,
        email: ev.createdBy.email
      } : undefined
    }));
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      if (error.response.status === 401) throw new AuthError('Session expired');
      throw new Error(error.response.data?.message || 'Failed to load your events');
    }
    throw error instanceof Error ? error : new Error('An unexpected error occurred');
  }
}

export async function getEventById(id: string): Promise<EventData> {
  if (!id) throw new Error('No event ID provided');

  try {
    const resp = await api.get<RawEvent>(`/api/event/${id}`);
    const ev = resp.data;

    return {
      id: ev._id,
      title: ev.title,
      startDate: isValidDate(ev.startDate) ? ev.startDate : '1970-01-01',
      endDate: isValidDate(ev.endDate) ? ev.endDate : '1970-01-01',
      startTime: isValidTime(ev.startTime) ? ev.startTime : '00:00',
      endTime: isValidTime(ev.endTime) ? ev.endTime : '00:00',
      location: ev.location,
      description: ev.description || '',
      bannerUrl: ev.photos && ev.photos.length > 0 ? processPhotoUrl(ev.photos[0]) : '',
      photos: ev.photos?.map(photo => processPhotoUrl(photo)) || [],
      category: ev.type as EventData['category'],
      visibility: ev.visibility,
      createdBy: ev.createdBy
        ? {
          _id: ev.createdBy._id,
          email: ev.createdBy.email,
          userInfo: ev.createdBy.userInfo
            ? {
              name: ev.createdBy.userInfo.name,
              profileImage: ev.createdBy.userInfo.profileImage
            }
            : undefined
        }
        : undefined,
      guests: ev.guests || []
    };
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response) {
      if (error.response.status === 401) throw new AuthError('Session expired');
      throw new Error(error.response.data?.message || 'Failed to load event details');
    }
    throw error instanceof Error ? error : new Error('An unexpected error occurred');
  }
}


export async function getEventsForMonth(
  monthDate: Date,
  page = 1,
  limit = 100
): Promise<{ events: EventData[]; pagination: PaginationData }> {
  const startDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
    .toISOString().split('T')[0];
  const endDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
    .toISOString().split('T')[0];

  return await getEvents(page, limit, { startDate, endDate });
}

export function groupEventsByDate(events: EventData[]): Record<string, EventData[]> {
  const map: Record<string, EventData[]> = {};
  events.forEach(event => {
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

export async function getEventsWithRange(
  startDate: string,
  endDate: string,
  page = 1,
  limit = 100
): Promise<{ events: EventData[]; pagination: PaginationData }> {
  return getEvents(page, limit, { startDate, endDate });
}
// ✅ Reuse mapping logic
function convertRawEventToEventData(ev: RawEvent): EventData {
  return {
    id: ev._id,
    title: ev.title,
    startDate: isValidDate(ev.startDate) ? ev.startDate : '1970-01-01',
    endDate: isValidDate(ev.endDate) ? ev.endDate : '1970-01-01',
    startTime: isValidTime(ev.startTime) ? ev.startTime : '00:00',
    endTime: isValidTime(ev.endTime) ? ev.endTime : '00:00',
    location: ev.location,
    description: ev.description || '',
    bannerUrl: ev.photos && ev.photos.length > 0 ? processPhotoUrl(ev.photos[0]) : '',
    photos: ev.photos?.map(processPhotoUrl) || [],
    category: ev.type as EventData['category'],
    visibility: ev.visibility,
    createdBy: ev.createdBy
      ? {
        _id: ev.createdBy._id,
        email: ev.createdBy.email,
        userInfo: ev.createdBy.userInfo
          ? {
            name: ev.createdBy.userInfo.name,
            profileImage: ev.createdBy.userInfo.profileImage,
          }
          : undefined,
      }
      : undefined,
    guests: ev.guests || [],
  };
}

// ✅ Unified error handler
function handleEventApiError(error: unknown, defaultMsg: string): Error {
  if (error instanceof AxiosError && error.response) {
    if (error.response.status === 401) throw new AuthError('Session expired');
    throw new Error(error.response.data?.message || defaultMsg);
  }
  return error instanceof Error ? error : new Error(defaultMsg);
}
export async function getLikedEvents(): Promise<EventData[]> {
  try {
    const response = await api.get<RawEvent[]>('/api/event/liked');
    return response.data.map(convertRawEventToEventData);
  } catch (error) {
    throw handleEventApiError(error, 'Failed to fetch liked events');
  }
}

export async function getInterestedEvents(): Promise<EventData[]> {
  try {
    const response = await api.get<RawEvent[]>('/api/event/interested');
    return response.data.map(convertRawEventToEventData);
  } catch (error) {
    throw handleEventApiError(error, 'Failed to fetch interested events');
  }
}

export async function getGoingEvents(): Promise<EventData[]> {
  try {
    const response = await api.get<RawEvent[]>('/api/event/going');
    return response.data.map(convertRawEventToEventData);
  } catch (error) {
    throw handleEventApiError(error, 'Failed to fetch attending events');
  }
}
// Feedback entry returned from the server
export interface Feedback {
  _id: string;
  event: string;
  user: {
    _id: string;
    email: string;
    profileImage?: string;
  };
  rating: number;
  message: string;
  likes: string[];
  createdAt: string;
  updatedAt: string;
}

// Aggregate stats for an event
export interface EventRating {
  averageRating: number;
  feedbackCount: number;
}

/** Submit (or overwrite) this user’s star feedback on an event */
export const addEventFeedback = (
  eventId: string,
  rating: number,
  message?: string
) => {
  return api.post<Feedback>(`/api/feedbacks/${eventId}`, { rating, message });
};

/** Load all feedback entries (stars + messages) for an event */
export const fetchEventFeedbacks = (eventId: string) => {
  return api.get<Feedback[]>(`/api/feedbacks/${eventId}`);
};

/** Load just the aggregate star‐average and count for an event */
export const fetchEventRating = (eventId: string) => {
  return api.get<EventRating>(`/api/feedbacks/${eventId}/rating`);
};