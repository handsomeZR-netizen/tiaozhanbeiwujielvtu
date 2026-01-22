export enum ViewState {
  SPLASH = 'SPLASH',
  ONBOARDING = 'ONBOARDING',
  APP = 'APP',
}

export enum Tab {
  HOME = 'HOME',
  MAP = 'MAP',
  DIARY = 'DIARY',
  STUDIO = 'STUDIO',
  COMMUNITY = 'COMMUNITY',
}

export interface UserProfile {
  name: string;
  originCountry: string;
  destinationCity: string;
  interests: string[];
  impressionTags: string[];
}

export interface AgentStep {
  id: string;
  name: string;
  desc: string;
  status: 'pending' | 'active' | 'completed';
}
