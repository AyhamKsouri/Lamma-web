// src/services/eventService.ts
import api from './api';
import { Event, NewEventPayload } from '../types';

export const getEvents = async (): Promise<Event[]> => {
  const { data } = await api.get<Event[]>('/api/event');
  return data;
};

export const getEventById = async (id: string): Promise<Event> => {
  const { data } = await api.get<Event>(`/api/event/${id}`);
  return data;
};

export const createEvent = async (payload: NewEventPayload): Promise<Event> => {
  const { data } = await api.post<Event>('/api/event', payload);
  return data;
};

// …and the other functions as before…
export const updateEvent = async (id: string, payload: NewEventPayload): Promise<Event> => {
  const { data } = await api.put<Event>(`/api/event/${id}`, payload);
  return data;
};