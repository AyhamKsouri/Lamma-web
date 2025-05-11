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
  visibility: 'public' | 'private';  // Added visibility here
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

interface PaginatedResponse {
  page: number;
  limit: number;
  totalPages: number | null;
  hasNextPage: boolean;
  events: RawEvent[];
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

export async function getEvents(): Promise<EventData[]> {
  try {
    const resp = await api.get<PaginatedResponse>('/api/event');
    
    if (!resp.data || !Array.isArray(resp.data.events)) {
      console.error('Unexpected response structure:', resp.data);
      throw new Error('Invalid response format from server');
    }

    return resp.data.events.map((ev) => ({
      id: ev._id,
      title: ev.title,
      startDate: ev.startDate,
      endDate: ev.endDate,
      startTime: ev.startTime,
      endTime: ev.endTime,
      location: ev.location,
      bannerUrl: ev.photos?.[0] || '',
      category: ev.type as EventData['category'],
      visibility: ev.visibility,  // Added visibility here
    }));
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
    // Log the incoming data
    console.log('Creating event with data:', eventData);

    const formData = new FormData();
    formData.append('title', eventData.title);
    formData.append('description', eventData.description);
    formData.append('startDate', eventData.startDate);
    formData.append('endDate', eventData.endDate);
    formData.append('startTime', eventData.startTime);
    formData.append('endTime', eventData.endTime);
    formData.append('location', eventData.location);
    formData.append('type', eventData.type);
    formData.append('visibility', eventData.visibility);
    formData.append('price', eventData.price.toString());

    // Log FormData entries
    console.log('FormData entries:');
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    if (eventData.photos && eventData.photos.length > 0) {
      eventData.photos.forEach(photo => {
        formData.append('photos', photo);
      });
    }

    const resp = await api.post<{success: boolean; data: RawEvent}>('/api/event', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Log the response
    console.log('Server response:', resp.data);

    if (!resp.data || !resp.data.data) {
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
      visibility: event.visibility,  // Added visibility here
    };
  } catch (error: unknown) {
    console.error('Create Event Error:', error);
    
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        throw new AuthError('Session expired');
      }
      console.error('Server Error Response:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to create event');
    }
    throw new Error('An unexpected error occurred');
  }
}