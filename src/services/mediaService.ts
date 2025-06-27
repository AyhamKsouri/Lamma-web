// src/services/mediaService.ts
import api from "@/services/api";

const BASE = "/api/event-media";

export interface Media {
  _id: string;
  url: string;
  likes: string[];
  uploadedBy: {
    _id: string;
    userInfo?: { name?: string; profileImage?: string };
  };
}

// GET /api/event-media/:eventId
export const getMediaByEvent = (eventId: string) =>
  api.get<Media[]>(`${BASE}/${eventId}`);

// POST /api/event-media/
//   expects FormData with fields:
//     - media (file[] or single file, depending on your middleware)
//     - eventId (string)
export const uploadMedia = (formData: FormData) =>
  api.post<Media>(`${BASE}/`, formData);

// PUT /api/event-media/:mediaId/like
export const toggleLikeMedia = (mediaId: string) =>
  api.put<{ likes: string[] }>(`${BASE}/${mediaId}/like`);

// (optional) if you want to archive a media item
export const archiveMedia = (mediaId: string) =>
  api.put(`${BASE}/${mediaId}/archive`);

// (optional) delete a media item
export const deleteMedia = (mediaId: string) =>
  api.delete(`${BASE}/${mediaId}`);
