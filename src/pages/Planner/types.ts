export interface PlannerFormData {
  destination: string; // ID
  destinationName: string; // Name for display
  travelDate: string;
  interests: string[];
  budget: string;
  peopleGroup: string;
}

export interface InterestOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}