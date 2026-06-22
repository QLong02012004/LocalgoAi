export interface ItineraryActivity {
  time: string;
  location: string;
  note: string;
}

export interface DayItinerary {
  day: number;
  date: string;
  theme: string;
  activities: ItineraryActivity[];
}

export interface ItineraryType {
  id: string | number;
  trip_name: string;
  img: string;
  price: number;
  maxPeople: number;
  location: string;
  duration: string;
  rating: number;
  category: string;
  type?: string;
  itinerary: DayItinerary[];
}

export interface FilterState {
  location: string;
  provinceId?: number;
  minBudget?: number;
  maxBudget?: number;
  priceRange: string;
  days?: number;
  people: number;
}
