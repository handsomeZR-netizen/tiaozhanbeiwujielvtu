export interface ItineraryForm {
  city: string;
  startDate: string;
  endDate: string;
  days: number;
  travelers: {
    count: number;
    type: 'solo' | 'couple' | 'family' | 'friends';
  };
  interests: string[];
  intensity: 'relaxed' | 'moderate' | 'packed';
  budget: 'economy' | 'comfortable' | 'luxury';
  transport: 'walking' | 'public' | 'taxi' | 'driving';
  requirements: string[];
  mustVisit?: string[];
}

export interface ItineraryActivity {
  id: string;
  time: string;
  duration: number; // minutes
  title: string;
  description: string;
  category: string;
  poi?: {
    id: string;
    name: string;
    lng: number;
    lat: number;
  };
  tips?: string[];
  estimatedCost?: number;
}

export interface ItineraryDay {
  date: string;
  dayNumber: number;
  theme: string;
  activities: ItineraryActivity[];
  totalDistance?: number;
  totalCost?: number;
}

export interface ItineraryRecord {
  id: string;
  form: ItineraryForm;
  days: ItineraryDay[];
  summary: string;
  createdAt: string;
  totalSpots: number;
  totalBudget: number;
}

export interface Agent {
  id: string;
  name: string;
  desc: string;
  duration: number;
  steps: string[];
}
