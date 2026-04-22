export type SportCategory =
  | 'all'
  | 'nfl'
  | 'nba'
  | 'mlb'
  | 'nhl'
  | 'soccer'
  | 'college-football'
  | 'college-basketball'
  | 'golf'
  | 'tennis'
  | 'mma'
  | 'racing'
  | 'other';

export type ServiceGroup = 'major' | 'league';

export interface StreamingService {
  id: string;
  name: string;
  color: string;
  group: ServiceGroup;
  deepLinks: {
    /** Apple TV (tvOS). */
    tvos?: string;
    /** iPhone / iPad. Falls back to `tvos` when unset. */
    ios?: string;
    android?: string;
    /** Android TV / Fire TV — never fall back to web on TV */
    androidTv?: string;
    web?: string;
  };
}

export interface Channel {
  id: string;
  name: string;
  serviceIds: string[];
}

export interface RegionalBroadcast {
  type: 'home' | 'away' | 'national';
  channel: string;
}

export interface SportEvent {
  id: string;
  title: string;
  subtitle?: string;
  sport: SportCategory;
  league: string;
  channel: string;
  regionalChannels?: RegionalBroadcast[];
  startTime: string;
  endTime?: string;
  status: 'upcoming' | 'live' | 'final';
  homeTeam?: string;
  awayTeam?: string;
  homeTeamId?: string;
  awayTeamId?: string;
  homeScore?: string;
  awayScore?: string;
  thumbnail?: string;
  availableServices: string[];
}

export type TimeGroup = 'live' | 'starting-soon' | 'later-today' | 'tomorrow';

export interface GroupedEvents {
  group: string;
  label: string;
  events: SportEvent[];
}

export interface UserPreferences {
  selectedServices: string[];
  selectedSport: SportCategory;
  favoriteTeams: string[];
  favoriteSports: string[];
  tvMarket: string | null;
  onboardingComplete: boolean;
}

export interface MarketInfo {
  id: string;
  label: string;
}

export interface TeamInfo {
  sport: string;
  league: string;
  teamId: string;
  teamName: string;
}
