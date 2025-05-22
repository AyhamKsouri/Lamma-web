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

const API_BASE_URL = "http://localhost:3000";

// Validate date/time format
const isValidDate = (date: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(date);
const isValidTime = (time: string): boolean => /^\d{2}:\d{2}(:\d{2})?$/.test(time);

function processPhotoUrl(url?: string): string {
  if (!url) return "/fallback-image.png";
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const normalizedUrl = url.startsWith('/uploads/eventMedia/') 
    ? url 
    : `/uploads/eventMedia/${url.replace(/^\/+/, '')}`;
  return `${API_BASE_URL}${normalizedUrl}`;
}

export async function getEvents(
  page: number = 1,
  limit: number = 10,
  filters: EventFilters = {}
): Promise<{ events: EventData[]; pagination: PaginationData }> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(filters.category && filters.category !== 'all' && { type: filters.category }),
    ...(filters.searchTerm && { search: filters.searchTerm }),
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
    ...(filters.visibility && { visibility: filters.visibility }),
  });
  try {
    const resp = await api.get<PaginatedResponse>(`/api/event?${params}`);
    if (!resp.data || !Array.isArray(resp.data.events)) {
      throw new Error('Invalid response format from server');
    }
    const events: EventData[] = resp.data.events.map(ev => ({
      id: ev._id,
      title: ev.title,
      startDate: isValidDate(ev.startDate) ? ev.startDate : '1970-01-01',
      endDate: isValidDate(ev.endDate) ? ev.endDate : '1970-01-01',
      startTime: isValidTime(ev.startTime) ? ev.startTime : '00:00',
      endTime: isValidTime(ev.endTime) ? ev.endTime : '00:00',
      location: ev.location,
      description: ev.description,
      bannerUrl: ev.photos && ev.photos.length > 0 ? processPhotoUrl(ev.photos[0]) : '',
      photos: ev.photos?.map(photo => processPhotoUrl(photo)) || [],
      category: ev.type as EventData['category'],
      visibility: ev.visibility,
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
    if (!resp.data?.data) throw new Error('Invalid response format from server');
    const ev = resp.data.data;
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
    }));
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      if (error.response.status === 401) throw new AuthError('Session expired');
      throw new Error(error.response.data?.message || 'Failed to load your events');
    }
    throw error instanceof Error ? error : new Error('An unexpected error occurred');
  }
}

/**
 * Fetch a single event by its ID.
 */
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
    };
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response) {
      if (error.response.status === 401) throw new AuthError('Session expired');
      throw new Error(error.response.data?.message || 'Failed to load event details');
    }
    throw error instanceof Error ? error : new Error('An unexpected error occurred');
  }
}
