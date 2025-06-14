// src/services/reservationService.ts
import api from "./api";

export interface Reservation {
  _id: string;
  event: string;
  user: { _id: string; userInfo?: { name?: string }; email?: string };
  numberOfPeople: number;
  status: "pending" | "confirmed" | "rejected" | "canceled";
}

export function makeReservation(eventId: string, numberOfPeople: number) {
  return api.post<Reservation>(`/api/reservation/${eventId}`, { numberOfPeople });
}

export function updateReservation(reservationId: string, numberOfPeople: number) {
  return api.put<Reservation>(`/api/reservation/${reservationId}`, { numberOfPeople });
}

export function cancelReservation(reservationId: string) {
  return api.delete(`/api/reservation/${reservationId}`);
}

export function respondToReservation(reservationId: string, status: Reservation["status"]) {
  return api.put<Reservation>(`/api/reservation/${reservationId}/respond`, { status });
}

export function getEventReservations(eventId: string) {
  return api.get<Reservation[]>(`/api/reservation/${eventId}`);
}

export function getMyReservations() {
  return api.get<Reservation[]>(`/api/reservation/user/mine`);
}
