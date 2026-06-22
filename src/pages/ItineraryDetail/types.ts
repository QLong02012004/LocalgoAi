export interface CostBreakdown {
  accommodation: number;
  food: number;
  activities: number;
  services: number;
  total: number;
}

export interface RoutePoint {
  id: string;
  entityId?: number | string;
  name: string;
  lat: number;
  lng: number;
  latitude?: number; // For BE compatibility
  longitude?: number; // For BE compatibility
  time: string; // HH:mm format
  endTime?: string; // HH:mm format
  durationMinutes?: number;
  type: 'hotel' | 'restaurant' | 'attraction' | 'shopping' | 'other';
  imageUrl?: string;
  day: number;
  description?: string;
  address?: string;
  note?: string;
  rating?: number;
  estimatedCost?: number;
  costBreakdown?: CostBreakdown;
  tips?: string | string[];
  galleryImages?: string[];
  reviewCount?: number;
  pricePerNight?: number;
  nights?: number;
  alternatives?: Omit<RoutePoint, 'id' | 'day' | 'time' | 'endTime'>[];
}


export interface TravelMetric {
  distance: string;
  duration: number;
}
