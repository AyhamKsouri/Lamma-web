export type RSVP = 'yes' | 'no' | 'maybe';

// A guest entry on an event
export interface Guest {
  user: string;       // ObjectId as string
  rsvp: RSVP;
}

// A comment left on an event
export interface Comment {
  author: string;     // ObjectId as string
  message: string;
  replyTo?: string;   // ObjectId as string, if it’s a reply
  createdAt: string;  // ISO date string
}

// A feedback entry on an event
export interface Feedback {
  user: string;       // ObjectId as string
  rating: number;
  message?: string;
  createdAt: string;  // ISO date string
}

// An item in the gallery
export type MediaType = 'photo' | 'video';
export interface GalleryItem {
  uploadedBy: string; // ObjectId as string
  mediaUrl: string;
  mediaType: MediaType;
  uploadedAt: string; // ISO date string
}

export interface Event {
  _id: string;
  title: string;
  startDate: string;    // ISO date string
  endDate: string;      // ISO date string
  startTime: string;    // e.g. "15:00"
  endTime: string;      // e.g. "18:00"
  location: string;
  description?: string;
  type:
    | 'clubbing'
    | 'rave'
    | 'birthday'
    | 'wedding'
    | 'food'
    | 'sport'
    | 'meeting'
    | 'conference'
    | 'other';
  visibility: 'public' | 'private';
  createdBy: string;    // ObjectId as string
  price: number;
  bookingLink?: string;
  deleted: boolean;
  guests: Guest[];
  likes: string[];      // array of ObjectId strings
  interested: string[]; // array of ObjectId strings
  going: string[];      // array of ObjectId strings
  comments: Comment[];
  feedbacks: Feedback[];
  photos: string[];     // array of URLs
  gallery: GalleryItem[];
  createdAt: string;    // ISO date string
  updatedAt: string;    // ISO date string
}

export interface NewEventPayload {
  title: string;
  startDate: string;    // ISO date string
  endDate: string;      // ISO date string
  startTime: string;    // e.g. "15:00"
  endTime: string;      // e.g. "18:00"
  location: string;
  description?: string;
  type?: Event['type'];           // defaults to "other" on the backend
  visibility?: Event['visibility']; // defaults to "private"
  price?: number;                 // defaults to 0
  bookingLink?: string;
  photos?: string[];              // if you support uploading URLs here
}
