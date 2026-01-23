export enum ViewState {
  SHOWCASE = 'SHOWCASE',
  SPLASH = 'SPLASH',
  ONBOARDING = 'ONBOARDING',
  ITINERARY_PLANNER = 'ITINERARY_PLANNER',
  APP = 'APP',
}

export enum Tab {
  HOME = 'HOME',
  MAP = 'MAP',
  DIARY = 'DIARY',
  STUDIO = 'STUDIO',
  COMMUNITY = 'COMMUNITY',
}

export interface OnboardingProfile {
  name: string;
  originCountry: string;
  destinationCity: string;
  interests: string[];
  impressionTags: string[];
}

export interface UserAccount {
  id?: string;
  username: string;
  email?: string;
  avatarUrl?: string | null;
  bio?: string | null;
  createdAt?: string;
  name?: string;
}

export interface AgentStep {
  id: string;
  name: string;
  desc: string;
  status: 'pending' | 'active' | 'completed';
}

export type StoryPoi = {
  id: string;
  name: string;
  lng: number;
  lat: number;
  address?: string;
};

export type StoryScene = {
  id: string;
  title: string;
  timeOfDay?: string;
  poi: StoryPoi;
  shot: string;
  narration: string;
  task: string;
  tip?: string;
  durationMinutes?: number;
};

export type StoryArc = {
  id: string;
  city: string;
  theme: string;
  title: string;
  logline: string;
  summary?: string;
  scenes: StoryScene[];
};
