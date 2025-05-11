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
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  photos?: string[];
  type: string;
}

export async function getEvents(): Promise<EventData[]> {
  try {
    const resp = await api.get<RawEvent[]>('/event');
    return resp.data.map((ev) => ({
      id: ev._id,
      title: ev.title,
      startDate: ev.startDate,
      endDate: ev.endDate,
      startTime: ev.startTime,
      endTime: ev.endTime,
      location: ev.location,
      bannerUrl: ev.photos?.[0] || '',
      category: ev.type as EventData['category'],
    }));
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching events:', error.message);
    }
    
    // Type guard for AxiosError
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        throw new AuthError('Session expired');
      }
      throw new Error(error.response?.data?.message || 'Failed to load events');
    }
    
    // For any other type of error
    throw new Error('An unexpected error occurred');
  }
}