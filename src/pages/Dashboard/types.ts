export interface ChecklistItem {
  id: string;
  label: string;
  isCompleted: boolean;
}

export interface TripPlan {
  id: string;
  title: string;
  dateRange: string;
  days: number;
  people: number;
  image: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  checklist: ChecklistItem[];
}