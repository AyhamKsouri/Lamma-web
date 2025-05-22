// src/services/adminService.ts
import { apiClient } from "./api";

// — Types ——————————————————————————————————————————————————————

export interface Analytics {
  totalUsers: number;
  totalEvents: number;
  totalMedia: number;
  deletedEvents: number;
  deletedMedia: number;
}

export interface EventRecord {
  _id: string;
  title?: string;
  bannerUrl?: string;
  startDate: string;
  endDate: string;
  location: string;
  description?: string;
  createdBy: string;
}

export interface MediaRecord {
  _id: string;
  filename?: string;
  url?: string;
}

/** A user record for admin management */
export interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  deleted?: boolean;
  profileImage?: string;
}
export interface AdminEventRecord {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  deleted: boolean;
  banned: boolean;
  createdBy: {
    _id: string;
    role: string;
    userInfo: {
      _id: string;
      name: string;
      email: string;
      profileImage?: string;
    };
  };
}


// — Service calls ——————————————————————————————————————————————————

export function getPlatformAnalytics(): Promise<Analytics> {
  return apiClient.get<Analytics>("/api/admin/analytics");
}

export function getDeletedEvents(): Promise<EventRecord[]> {
  return apiClient.get<EventRecord[]>("/api/admin/events/deleted");
}

export function restoreEvent(id: string): Promise<void> {
  return apiClient.put<void>(`/api/admin/events/restore/${id}`);
}

export function hardDeleteEvent(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/admin/events/${id}`);
}

export function getDeletedMedia(): Promise<MediaRecord[]> {
  return apiClient.get<MediaRecord[]>("/api/admin/media/deleted");
}

export function restoreMedia(id: string): Promise<void> {
  return apiClient.put<void>(`/api/admin/media/restore/${id}`);
}

export function hardDeleteMedia(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/admin/media/${id}`);
}

export function getAllUsers(): Promise<UserRecord[]> {
  return apiClient.get<UserRecord[]>("/api/admin/users");
}

export function getUserById(id: string): Promise<UserRecord> {
  return apiClient.get<UserRecord>(`/api/admin/users/${id}`);
}

export function updateUserRole(
  id: string,
  role: string
): Promise<UserRecord> {
  return apiClient.put<UserRecord>(`/api/admin/users/${id}`, { role });
} 

export function softDeleteUser(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/admin/users/${id}`);
}
// adminService.ts
export function getEventsByUser(id: string) {
  return apiClient.get<EventRecord[]>(`/api/admin/users/${id}/events`);
}

export function getAllEvents(): Promise<AdminEventRecord[]> {
  return apiClient.get<AdminEventRecord[]>("/api/admin/events");
}

export function banEvent(id: string): Promise<void> {
  return apiClient.put<void>(`/api/admin/events/${id}/ban`);
}

export function deleteEvent(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/admin/events/${id}`);
}
