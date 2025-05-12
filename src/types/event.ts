export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  limit: number;
}

export interface EventData {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
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

export interface CalendarState {
  events: EventData[];
  pagination: PaginationData;
  loading: boolean;
  error: string | null;
}

export interface EventFilters {
  category?: string;
  searchTerm?: string;
  visibility?: 'public' | 'private';
}

export interface CalendarWeekDay {
  short: string;
  long: string;
}

export interface CalendarCellProps {
  date: Date | null;
  isSelected: boolean;
  isToday: boolean;
  events: EventData[];
  onSelect: (date: Date) => void;
}

export interface CalendarControlsProps {
  currentMonth: Date;
  onMonthChange: (offset: number) => void;
  onTodayClick: () => void;
}

export interface EventCardProps {
  event: EventData;
  isSelected: boolean;
  onClick: (event: EventData) => void;
}

export interface EventsSidePanelProps {
  selectedDate: Date | null;
  selectedEvent: EventData | null;
  events: EventData[];
  onEventClick: (event: EventData) => void;
}